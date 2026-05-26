import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function boolValue(value: unknown): boolean {
  return String(value).toLowerCase() === "true";
}

export async function GET() {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "xia-speech-15062026";
    const dataset = process.env.BIGQUERY_DATASET || "speech_analytics";

    const bq = new BigQuery({ projectId });

    const query = `
      WITH resumen AS (
        SELECT
          COUNT(DISTINCT call_id) AS total_llamadas,
          AVG(SAFE_CAST(score_experiencia_cliente AS FLOAT64)) AS score_experiencia_promedio,
          SUM(CASE WHEN LOWER(CAST(riesgo_reclamo_futuro_detectado AS STRING)) = 'true' THEN 1 ELSE 0 END) AS llamadas_riesgo_reclamo_futuro,
          SUM(CASE WHEN LOWER(CAST(fuga_explicita_cliente_detectado AS STRING)) = 'true' THEN 1 ELSE 0 END) AS llamadas_fuga,
          SUM(CASE WHEN LOWER(CAST(riesgo_abandono_detectado AS STRING)) = 'true' THEN 1 ELSE 0 END) AS llamadas_abandono,
          SUM(CASE WHEN LOWER(CAST(no_show_detectado AS STRING)) = 'true' THEN 1 ELSE 0 END) AS llamadas_no_show
        FROM \`${projectId}.${dataset}.speech_qa_resumen_llamada\`
      ),
      cumplimiento AS (
        SELECT
          SAFE_DIVIDE(SUM(puntaje_obtenido), SUM(puntaje_objetivo_aplicable)) * 100 AS cumplimiento_qa
        FROM \`${projectId}.${dataset}.speech_qa_pauta_long\`
        WHERE puntaje_objetivo_aplicable > 0
      )
      SELECT * FROM resumen CROSS JOIN cumplimiento
    `;

    const [kpiRows] = await bq.query({ query });
    const kpi = (kpiRows[0] || {}) as Row;

    const [bloques] = await bq.query({
      query: `
        SELECT
          bloque,
          SAFE_DIVIDE(SUM(puntaje_obtenido), SUM(puntaje_objetivo_aplicable)) * 100 AS cumplimiento
        FROM \`${projectId}.${dataset}.speech_qa_resumen_bloques\`
        WHERE puntaje_objetivo_aplicable > 0
        GROUP BY bloque
        ORDER BY cumplimiento DESC
      `,
    });

    const [incumplidos] = await bq.query({
      query: `
        SELECT
          subatributo,
          COUNT(*) AS cantidad
        FROM \`${projectId}.${dataset}.speech_qa_pauta_long\`
        WHERE resultado = 'no_cumple'
        GROUP BY subatributo
        ORDER BY cantidad DESC
        LIMIT 10
      `,
    });

    const [motivos] = await bq.query({
      query: `
        SELECT
          motivo_detectado_nombre AS motivo,
          COUNT(*) AS cantidad
        FROM \`${projectId}.${dataset}.speech_qa_resumen_llamada\`
        GROUP BY motivo
        ORDER BY cantidad DESC
        LIMIT 10
      `,
    });

    const [resultadoQa] = await bq.query({
      query: `
        SELECT
          resultado,
          COUNT(*) AS cantidad
        FROM \`${projectId}.${dataset}.speech_qa_pauta_long\`
        GROUP BY resultado
        ORDER BY cantidad DESC
      `,
    });

    const [silencios] = await bq.query({
      query: `
        SELECT
          AVG(silence_percentage) AS silencio_promedio,
          AVG(longest_silence_seconds) AS silencio_mas_largo_promedio,
          SUM(critical_silence_count) AS silencios_criticos
        FROM \`${projectId}.${dataset}.speech_analytics_timeline\`
      `,
    });

    const [detalle] = await bq.query({
      query: `
        SELECT
          call_id,
          fecha_analisis,
          motivo_detectado_nombre,
          resultado_general_nombre,
          nivel_cumplimiento_general,
          score_experiencia_cliente,
          riesgo_reclamo_futuro_detectado,
          fuga_explicita_cliente_detectado,
          resumen_ejecutivo
        FROM \`${projectId}.${dataset}.speech_qa_resumen_llamada\`
        ORDER BY fecha_analisis DESC
        LIMIT 20
      `,
    });

    const silenceRow = (silencios[0] || {}) as Row;

    return NextResponse.json({
      ok: true,
      kpis: {
        total_llamadas: num(kpi.total_llamadas),
        cumplimiento_qa: num(kpi.cumplimiento_qa),
        score_experiencia_promedio: num(kpi.score_experiencia_promedio),
        llamadas_riesgo_reclamo_futuro: num(kpi.llamadas_riesgo_reclamo_futuro),
        llamadas_fuga: num(kpi.llamadas_fuga),
        porcentaje_riesgo_fuga:
          num(kpi.total_llamadas) > 0 ? (num(kpi.llamadas_fuga) / num(kpi.total_llamadas)) * 100 : 0,
        silencio_promedio: num(silenceRow.silencio_promedio),
        silencio_mas_largo_promedio: num(silenceRow.silencio_mas_largo_promedio),
        silencios_criticos: num(silenceRow.silencios_criticos),
      },
      bloques: bloques.map((r: Row) => ({
        bloque: str(r.bloque),
        cumplimiento: num(r.cumplimiento),
      })),
      incumplidos: incumplidos.map((r: Row) => ({
        subatributo: str(r.subatributo),
        cantidad: num(r.cantidad),
      })),
      motivos: motivos.map((r: Row) => ({
        motivo: str(r.motivo) || "Sin motivo",
        cantidad: num(r.cantidad),
      })),
      resultadoQa: resultadoQa.map((r: Row) => ({
        resultado: str(r.resultado),
        cantidad: num(r.cantidad),
      })),
      detalle: detalle.map((r: Row) => ({
        call_id: str(r.call_id),
        fecha_analisis: str(r.fecha_analisis),
        motivo_detectado_nombre: str(r.motivo_detectado_nombre),
        resultado_general_nombre: str(r.resultado_general_nombre),
        nivel_cumplimiento_general: str(r.nivel_cumplimiento_general),
        score_experiencia_cliente: num(r.score_experiencia_cliente),
        riesgo_reclamo_futuro_detectado: boolValue(r.riesgo_reclamo_futuro_detectado),
        fuga_explicita_cliente_detectado: boolValue(r.fuga_explicita_cliente_detectado),
        resumen_ejecutivo: str(r.resumen_ejecutivo),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}