import { NextRequest, NextResponse } from "next/server";
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

function sqlDate(value: string | null): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export async function GET(request: NextRequest) {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "xia-speech-15062026";
    const dataset = process.env.BIGQUERY_DATASET || "speech_analytics";

    const { searchParams } = new URL(request.url);
    const from = sqlDate(searchParams.get("from"));
    const to = sqlDate(searchParams.get("to"));

    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const resumenDateExpr = "DATE(COALESCE(fecha_analisis, created_at))";
    const pautaDateExpr = "DATE(COALESCE(fecha_analisis, created_at))";

    const resumenFilter = `
      WHERE call_id IS NOT NULL
      ${from ? `AND ${resumenDateExpr} >= @from` : ""}
      ${to ? `AND ${resumenDateExpr} <= @to` : ""}
    `;

    const pautaFilter = `
      WHERE call_id IS NOT NULL
      ${from ? `AND ${pautaDateExpr} >= @from` : ""}
      ${to ? `AND ${pautaDateExpr} <= @to` : ""}
    `;

    const bq = new BigQuery({ projectId });

    const [kpiRows] = await bq.query({
      params,
      query: `
        WITH llamadas AS (
          SELECT
            call_id,
            ANY_VALUE(score_experiencia_cliente) AS score_experiencia_cliente,
            ANY_VALUE(riesgo_reclamo_futuro_detectado) AS riesgo_reclamo_futuro_detectado,
            ANY_VALUE(riesgo_abandono_detectado) AS riesgo_abandono_detectado,
            ANY_VALUE(fuga_explicita_cliente_detectado) AS fuga_explicita_cliente_detectado
          FROM \`${projectId}.${dataset}.speech_qa_resumen_llamada\`
          ${resumenFilter}
          GROUP BY call_id
        ),
        cumplimiento AS (
          SELECT
            call_id,
            SAFE_DIVIDE(SUM(puntaje_obtenido), SUM(puntaje_objetivo_aplicable)) * 100 AS cumplimiento_qa
          FROM \`${projectId}.${dataset}.speech_qa_pauta_long\`
          ${pautaFilter}
            AND puntaje_objetivo_aplicable > 0
          GROUP BY call_id
        )
        SELECT
          COUNT(DISTINCT l.call_id) AS total_llamadas,
          AVG(c.cumplimiento_qa) AS cumplimiento_qa,
          AVG(SAFE_CAST(l.score_experiencia_cliente AS FLOAT64)) AS score_experiencia_promedio,
          SUM(CASE WHEN LOWER(CAST(l.riesgo_reclamo_futuro_detectado AS STRING)) = 'true' THEN 1 ELSE 0 END) AS llamadas_riesgo_reclamo_futuro,
          SUM(CASE WHEN LOWER(CAST(l.riesgo_abandono_detectado AS STRING)) = 'true' THEN 1 ELSE 0 END) AS llamadas_riesgo_abandono,
          SUM(CASE WHEN LOWER(CAST(l.fuga_explicita_cliente_detectado AS STRING)) = 'true' THEN 1 ELSE 0 END) AS llamadas_fuga
        FROM llamadas l
        LEFT JOIN cumplimiento c ON l.call_id = c.call_id
      `,
    });

    const [motivosDrill] = await bq.query({
      params,
      query: `
        SELECT
          COALESCE(tipo_contacto_codigo, 'sin_tipo') AS tipo_contacto_codigo,
          COALESCE(categoria_detectada, 'sin_categoria') AS categoria_detectada,
          COALESCE(motivo_detectado_nombre, motivo_detectado, 'Sin motivo') AS motivo_detectado_nombre,
          COALESCE(submotivo_detectado_nombre, submotivo_detectado, 'Sin submotivo') AS submotivo_detectado_nombre,
          COUNT(DISTINCT call_id) AS cantidad
        FROM \`${projectId}.${dataset}.speech_qa_resumen_llamada\`
        ${resumenFilter}
        GROUP BY tipo_contacto_codigo, categoria_detectada, motivo_detectado_nombre, submotivo_detectado_nombre
        ORDER BY cantidad DESC
      `,
    });

    const [bloques] = await bq.query({
      params,
      query: `
        SELECT
          bloque,
          SAFE_DIVIDE(SUM(puntaje_obtenido), SUM(puntaje_objetivo_aplicable)) * 100 AS cumplimiento
        FROM \`${projectId}.${dataset}.speech_qa_resumen_bloques\`
        ${pautaFilter}
          AND puntaje_objetivo_aplicable > 0
        GROUP BY bloque
        ORDER BY cumplimiento DESC
      `,
    });

    const [incumplidos] = await bq.query({
      params,
      query: `
        SELECT
          subatributo,
          COUNT(DISTINCT call_id) AS cantidad
        FROM \`${projectId}.${dataset}.speech_qa_pauta_long\`
        ${pautaFilter}
          AND resultado = 'no_cumple'
        GROUP BY subatributo
        ORDER BY cantidad DESC
        LIMIT 15
      `,
    });

    const [detalle] = await bq.query({
      params,
      query: `
        WITH cumplimiento AS (
          SELECT
            call_id,
            SAFE_DIVIDE(SUM(puntaje_obtenido), SUM(puntaje_objetivo_aplicable)) * 100 AS cumplimiento_qa
          FROM \`${projectId}.${dataset}.speech_qa_pauta_long\`
          ${pautaFilter}
            AND puntaje_objetivo_aplicable > 0
          GROUP BY call_id
        )
        SELECT
          r.call_id,
          COALESCE(r.fecha_analisis, r.created_at) AS fecha_analisis,
          r.tipo_contacto_codigo,
          r.categoria_detectada,
          r.motivo_detectado,
          r.motivo_detectado_nombre,
          r.submotivo_detectado,
          r.submotivo_detectado_nombre,
          r.resultado_general_nombre,
          r.nivel_cumplimiento_general,
          r.score_experiencia_cliente,
          r.riesgo_reclamo_futuro_detectado,
          r.riesgo_abandono_detectado,
          r.fuga_explicita_cliente_detectado,
          r.resumen_ejecutivo,
          c.cumplimiento_qa
        FROM \`${projectId}.${dataset}.speech_qa_resumen_llamada\` r
        LEFT JOIN cumplimiento c ON r.call_id = c.call_id
        ${resumenFilter}
        QUALIFY ROW_NUMBER() OVER (PARTITION BY r.call_id ORDER BY COALESCE(r.fecha_analisis, r.created_at) DESC) = 1
        ORDER BY fecha_analisis DESC
        LIMIT 500
      `,
    });

    const kpi = (kpiRows[0] || {}) as Row;
    const total = num(kpi.total_llamadas);

    return NextResponse.json({
      ok: true,
      filters: { from, to },
      kpis: {
        total_llamadas: total,
        cumplimiento_qa: num(kpi.cumplimiento_qa),
        score_experiencia_promedio: num(kpi.score_experiencia_promedio),
        llamadas_riesgo_reclamo_futuro: num(kpi.llamadas_riesgo_reclamo_futuro),
        llamadas_riesgo_abandono: num(kpi.llamadas_riesgo_abandono),
        llamadas_fuga: num(kpi.llamadas_fuga),
        porcentaje_riesgo_fuga: total > 0 ? (num(kpi.llamadas_fuga) / total) * 100 : 0,
      },
      motivosDrill: motivosDrill.map((r: Row) => ({
        tipo_contacto_codigo: str(r.tipo_contacto_codigo),
        categoria_detectada: str(r.categoria_detectada),
        motivo_detectado_nombre: str(r.motivo_detectado_nombre),
        submotivo_detectado_nombre: str(r.submotivo_detectado_nombre),
        cantidad: num(r.cantidad),
      })),
      bloques: bloques.map((r: Row) => ({
        bloque: str(r.bloque),
        cumplimiento: num(r.cumplimiento),
      })),
      incumplidos: incumplidos.map((r: Row) => ({
        subatributo: str(r.subatributo),
        cantidad: num(r.cantidad),
      })),
      detalle: detalle.map((r: Row) => ({
        call_id: str(r.call_id),
        fecha_analisis: str(r.fecha_analisis),
        tipo_contacto_codigo: str(r.tipo_contacto_codigo),
        categoria_detectada: str(r.categoria_detectada),
        motivo_detectado: str(r.motivo_detectado),
        motivo_detectado_nombre: str(r.motivo_detectado_nombre),
        submotivo_detectado: str(r.submotivo_detectado),
        submotivo_detectado_nombre: str(r.submotivo_detectado_nombre),
        resultado_general_nombre: str(r.resultado_general_nombre),
        nivel_cumplimiento_general: str(r.nivel_cumplimiento_general),
        score_experiencia_cliente: num(r.score_experiencia_cliente),
        cumplimiento_qa: num(r.cumplimiento_qa),
        riesgo_reclamo_futuro_detectado: boolValue(r.riesgo_reclamo_futuro_detectado),
        riesgo_abandono_detectado: boolValue(r.riesgo_abandono_detectado),
        fuga_explicita_cliente_detectado: boolValue(r.fuga_explicita_cliente_detectado),
        resumen_ejecutivo: str(r.resumen_ejecutivo),
        player_url: `/player?call_id=${encodeURIComponent(str(r.call_id))}`,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}