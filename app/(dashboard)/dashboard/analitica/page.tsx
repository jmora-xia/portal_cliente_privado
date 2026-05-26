"use client";

import { useEffect, useMemo, useState } from "react";

type Kpis = {
  total_llamadas: number;
  cumplimiento_qa: number;
  score_experiencia_promedio: number;
  llamadas_riesgo_reclamo_futuro: number;
  llamadas_fuga: number;
  porcentaje_riesgo_fuga: number;
};

type DetalleRow = {
  call_id: string;
  fecha_analisis: string;
  motivo_detectado_nombre: string;
  resultado_general_nombre: string;
  nivel_cumplimiento_general: string;
  score_experiencia_cliente: number;
  cumplimiento_qa: number;
  riesgo_reclamo_futuro_detectado: boolean;
  fuga_explicita_cliente_detectado: boolean;
  resumen_ejecutivo: string;
  player_url: string;
};

type ApiData = {
  ok: boolean;
  filters: { from: string | null; to: string | null };
  kpis: Kpis;
  bloques: { bloque: string; cumplimiento: number }[];
  incumplidos: { subatributo: string; cantidad: number }[];
  motivos: { motivo: string; cantidad: number }[];
  resultadoQa: { resultado: string; cantidad: number }[];
  detalle: DetalleRow[];
  error?: string;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

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
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const response = await fetch(`/api/qa-dashboard?${params.toString()}`, {
        cache: "no-store",
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resultadoTotal = useMemo(() => {
    return data?.resultadoQa.reduce((acc, item) => acc + item.cantidad, 0) || 1;
  }, [data]);

  if (loading && !data) {
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
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel QA Speech Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cumplimiento por llamadas únicas, riesgos, motivos y acceso directo al reproductor.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-3 shadow-sm">
          <label className="grid gap-1 text-xs font-semibold text-slate-500">
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm text-slate-800"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-500">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm text-slate-800"
            />
          </label>

          <button
            onClick={() => void loadData()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Llamadas analizadas" value={formatNumber(k.total_llamadas)} />
        <KpiCard title="Cumplimiento QA" value={formatPct(k.cumplimiento_qa)} tone="green" />
        <KpiCard title="Score experiencia" value={k.score_experiencia_promedio.toFixed(1)} tone="blue" />
        <KpiCard title="Riesgo reclamo futuro" value={formatNumber(k.llamadas_riesgo_reclamo_futuro)} tone="amber" />
        <KpiCard title="% riesgo fuga" value={formatPct(k.porcentaje_riesgo_fuga)} tone="red" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Cumplimiento por bloque" subtitle="Por llamada única">
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

        <Panel title="Distribución QA" subtitle="Cantidad de llamadas únicas">
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

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Ítems más incumplidos" subtitle="Call ID único">
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

        <Panel title="Motivos de contacto" subtitle="Call ID único">
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
      </section>

      <section className="mt-4">
        <Panel title="Todas las llamadas analizadas" subtitle="Detalle con acceso al reproductor">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <th className="p-3">Acción</th>
                  <th className="p-3">Call ID</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Motivo</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Cumplimiento</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Riesgo reclamo</th>
                  <th className="p-3">Fuga</th>
                  <th className="p-3">Resumen</th>
                </tr>
              </thead>

              <tbody>
                {data.detalle.map((row) => (
                  <tr key={row.call_id} className="border-b align-top last:border-0">
                    <td className="p-3">
                      <a
                        href={row.player_url}
                        className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      >
                        Escuchar llamada
                      </a>
                    </td>
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
                    <td className="p-3 font-semibold">{formatPct(row.cumplimiento_qa)}</td>
                    <td className="p-3 font-semibold">{row.score_experiencia_cliente.toFixed(1)}</td>
                    <td className="p-3"><BooleanBadge value={row.riesgo_reclamo_futuro_detectado} /></td>
                    <td className="p-3"><BooleanBadge value={row.fuga_explicita_cliente_detectado} /></td>
                    <td className="max-w-[420px] p-3 text-slate-600">{row.resumen_ejecutivo}</td>
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
  tone = "slate",
}: {
  title: string;
  value: string;
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
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
    <div className="grid grid-cols-[minmax(160px,240px)_1fr_90px] items-center gap-3">
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