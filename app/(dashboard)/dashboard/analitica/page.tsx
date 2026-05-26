"use client";

import { useEffect, useMemo, useState } from "react";

type Kpis = {
  total_llamadas: number;
  cumplimiento_qa: number;
  score_experiencia_promedio: number;
  llamadas_riesgo_reclamo_futuro: number;
  llamadas_fuga: number;
  porcentaje_riesgo_fuga: number;
  silencio_promedio: number;
  silencio_mas_largo_promedio: number;
  silencios_criticos: number;
};

type ApiData = {
  ok: boolean;
  kpis: Kpis;
  bloques: { bloque: string; cumplimiento: number }[];
  incumplidos: { subatributo: string; cantidad: number }[];
  motivos: { motivo: string; cantidad: number }[];
  resultadoQa: { resultado: string; cantidad: number }[];
  detalle: {
    call_id: string;
    fecha_analisis: string;
    motivo_detectado_nombre: string;
    resultado_general_nombre: string;
    nivel_cumplimiento_general: string;
    score_experiencia_cliente: number;
    riesgo_reclamo_futuro_detectado: boolean;
    fuga_explicita_cliente_detectado: boolean;
    resumen_ejecutivo: string;
  }[];
  error?: string;
};

function formatPct(value: number): string {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CL").format(Number(value || 0));
}

function maxValue<T>(rows: T[], getter: (row: T) => number): number {
  return Math.max(1, ...rows.map(getter));
}

export default function AnaliticaPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/qa-dashboard", { cache: "no-store" });
      const json = (await response.json()) as ApiData;

      if (!json.ok) {
        throw new Error(json.error || "No se pudo cargar el dashboard");
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const resultadoTotal = useMemo(() => {
    return data?.resultadoQa.reduce((acc, item) => acc + item.cantidad, 0) || 1;
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <p className="text-slate-500">Cargando datos desde BigQuery...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-red-700">Error al cargar dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <button
            onClick={() => void loadData()}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  const k = data.kpis;
  const maxBloque = maxValue(data.bloques, (r) => r.cumplimiento);
  const maxIncumplidos = maxValue(data.incumplidos, (r) => r.cantidad);
  const maxMotivos = maxValue(data.motivos, (r) => r.cantidad);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel QA Speech Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Datos reales desde BigQuery: cumplimiento, riesgos, motivos y silencios.
          </p>
        </div>

        <button
          onClick={() => void loadData()}
          className="w-fit rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
        >
          Actualizar
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Llamadas analizadas" value={formatNumber(k.total_llamadas)} helper="COUNT DISTINCT call_id" />
        <KpiCard title="Cumplimiento QA" value={formatPct(k.cumplimiento_qa)} helper="SUM obtenido / objetivo" tone="green" />
        <KpiCard title="Score experiencia" value={k.score_experiencia_promedio.toFixed(1)} helper="AVG score experiencia" tone="blue" />
        <KpiCard title="Riesgo futuro" value={formatNumber(k.llamadas_riesgo_reclamo_futuro)} helper="riesgo reclamo futuro" tone="amber" />
        <KpiCard title="% riesgo fuga" value={formatPct(k.porcentaje_riesgo_fuga)} helper="fuga explícita / total" tone="red" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Cumplimiento por bloque" subtitle="speech_qa_resumen_bloques">
          <div className="space-y-4">
            {data.bloques.map((row) => (
              <BarRow
                key={row.bloque}
                label={row.bloque || "Sin bloque"}
                value={formatPct(row.cumplimiento)}
                width={(row.cumplimiento / maxBloque) * 100}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Distribución QA" subtitle="speech_qa_pauta_long">
          <div className="space-y-3">
            {data.resultadoQa.map((row) => {
              const pct = (row.cantidad / resultadoTotal) * 100;
              return (
                <BarRow
                  key={row.resultado}
                  label={row.resultado || "Sin resultado"}
                  value={`${formatNumber(row.cantidad)} · ${formatPct(pct)}`}
                  width={pct}
                  tone={
                    row.resultado === "cumple"
                      ? "green"
                      : row.resultado === "no_cumple"
                        ? "red"
                        : "slate"
                  }
                />
              );
            })}
          </div>
        </Panel>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Ítems más incumplidos" subtitle="resultado = no_cumple">
          <div className="space-y-3">
            {data.incumplidos.map((row) => (
              <BarRow
                key={row.subatributo}
                label={row.subatributo || "Sin subatributo"}
                value={formatNumber(row.cantidad)}
                width={(row.cantidad / maxIncumplidos) * 100}
                tone="red"
              />
            ))}
          </div>
        </Panel>

        <Panel title="Motivos de contacto" subtitle="speech_qa_resumen_llamada">
          <div className="space-y-3">
            {data.motivos.map((row) => (
              <BarRow
                key={row.motivo}
                label={row.motivo || "Sin motivo"}
                value={formatNumber(row.cantidad)}
                width={(row.cantidad / maxMotivos) * 100}
                tone="blue"
              />
            ))}
          </div>
        </Panel>

        <Panel title="Silencios" subtitle="speech_analytics_timeline">
          <div className="grid gap-3">
            <MiniMetric label="Silencio promedio" value={formatPct(k.silencio_promedio)} />
            <MiniMetric label="Silencio más largo promedio" value={`${k.silencio_mas_largo_promedio.toFixed(1)}s`} />
            <MiniMetric label="Silencios críticos" value={formatNumber(k.silencios_criticos)} />
          </div>
        </Panel>
      </section>

      <section className="mt-4">
        <Panel title="Detalle de llamadas" subtitle="Últimas 20 llamadas">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <th className="p-3">Call ID</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Motivo</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Riesgo</th>
                  <th className="p-3">Fuga</th>
                  <th className="p-3">Resumen</th>
                </tr>
              </thead>
              <tbody>
                {data.detalle.map((row) => (
                  <tr key={row.call_id} className="border-b last:border-0">
                    <td className="p-3 font-mono text-xs text-slate-700">{row.call_id}</td>
                    <td className="p-3 text-slate-600">
                      {row.fecha_analisis ? new Date(row.fecha_analisis).toLocaleString("es-CL") : ""}
                    </td>
                    <td className="p-3">{row.motivo_detectado_nombre}</td>
                    <td className="p-3">{row.resultado_general_nombre}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {row.nivel_cumplimiento_general || "N/A"}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{row.score_experiencia_cliente.toFixed(1)}</td>
                    <td className="p-3">
                      <BooleanBadge value={row.riesgo_reclamo_futuro_detectado} />
                    </td>
                    <td className="p-3">
                      <BooleanBadge value={row.fuga_explicita_cliente_detectado} />
                    </td>
                    <td className="max-w-[360px] p-3 text-slate-600">{row.resumen_ejecutivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </main>
  );
}

function KpiCard({
  title,
  value,
  helper,
  tone = "slate",
}: {
  title: string;
  value: string;
  helper: string;
  tone?: "slate" | "green" | "blue" | "amber" | "red";
}) {
  const toneClass = {
    slate: "text-slate-900",
    green: "text-emerald-700",
    blue: "text-blue-700",
    amber: "text-amber-700",
    red: "text-red-700",
  }[tone];

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${toneClass}`}>{value}</p>
      <p className="mt-3 text-xs text-slate-400">{helper}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <span className="rounded-full border bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500">
          {subtitle}
        </span>
      </div>
      {children}
    </div>
  );
}

function BarRow({
  label,
  value,
  width,
  tone = "green",
}: {
  label: string;
  value: string;
  width: number;
  tone?: "green" | "red" | "blue" | "amber" | "slate";
}) {
  const color = {
    green: "bg-emerald-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    slate: "bg-slate-400",
  }[tone];

  return (
    <div className="grid grid-cols-[minmax(140px,220px)_1fr_80px] items-center gap-3">
      <div className="truncate text-sm font-medium text-slate-700" title={label}>
        {label}
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(2, Math.min(width, 100))}%` }} />
      </div>
      <div className="text-right text-sm font-semibold text-slate-600">{value}</div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function BooleanBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-bold ${
        value ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {value ? "Sí" : "No"}
    </span>
  );
}