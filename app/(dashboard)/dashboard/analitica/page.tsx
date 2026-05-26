"use client";

import { useEffect, useMemo, useState } from "react";

type MotivoDrill = {
  tipo_contacto_codigo: string;
  categoria_detectada: string;
  motivo_detectado_nombre: string;
  submotivo_detectado_nombre: string;
  cantidad: number;
};

type DetalleRow = {
  call_id: string;
  fecha_analisis: string;
  tipo_contacto_codigo: string;
  categoria_detectada: string;
  motivo_detectado: string;
  motivo_detectado_nombre: string;
  submotivo_detectado: string;
  submotivo_detectado_nombre: string;
  resultado_general_nombre: string;
  nivel_cumplimiento_general: string;
  score_experiencia_cliente: number;
  cumplimiento_qa: number;
  riesgo_reclamo_futuro_detectado: boolean;
  riesgo_abandono_detectado: boolean;
  fuga_explicita_cliente_detectado: boolean;
  resumen_ejecutivo: string;
  player_url: string;
};

type ApiData = {
  ok: boolean;
  kpis: {
    total_llamadas: number;
    cumplimiento_qa: number;
    score_experiencia_promedio: number;
    llamadas_riesgo_reclamo_futuro: number;
    llamadas_riesgo_abandono: number;
    llamadas_fuga: number;
    porcentaje_riesgo_fuga: number;
  };
  motivosDrill: MotivoDrill[];
  bloques: { bloque: string; cumplimiento: number }[];
  incumplidos: { subatributo: string; cantidad: number }[];
  detalle: DetalleRow[];
  error?: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function pct(value: number) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function n(value: number) {
  return new Intl.NumberFormat("es-CL").format(Number(value || 0));
}

function max<T>(rows: T[], getter: (row: T) => number) {
  return Math.max(1, ...rows.map(getter));
}

export default function AnaliticaPage() {
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [drill, setDrill] = useState<"tipo" | "categoria" | "motivo" | "submotivo">("tipo");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedMotivo, setSelectedMotivo] = useState("");
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState("");

  async function loadData() {
    setError("");
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/qa-dashboard?${params.toString()}`, { cache: "no-store" });
    const json = (await res.json()) as ApiData;

    if (!json.ok) {
      setError(json.error || "Error cargando datos");
      return;
    }

    setData(json);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const pieRows = useMemo(() => {
    const rows = data?.motivosDrill || [];
    const filtered = rows.filter((r) => {
      if (selectedTipo && r.tipo_contacto_codigo !== selectedTipo) return false;
      if (selectedCategoria && r.categoria_detectada !== selectedCategoria) return false;
      if (selectedMotivo && r.motivo_detectado_nombre !== selectedMotivo) return false;
      return true;
    });

    const key =
      drill === "tipo"
        ? "tipo_contacto_codigo"
        : drill === "categoria"
          ? "categoria_detectada"
          : drill === "motivo"
            ? "motivo_detectado_nombre"
            : "submotivo_detectado_nombre";

    const map = new Map<string, number>();

    filtered.forEach((r) => {
      const label = String(r[key] || "Sin dato");
      map.set(label, (map.get(label) || 0) + r.cantidad);
    });

    return [...map.entries()]
      .map(([label, cantidad]) => ({ label, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [data, drill, selectedTipo, selectedCategoria, selectedMotivo]);

  if (error) {
    return <div className="p-6 text-red-700">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-slate-500">Cargando dashboard...</div>;
  }

  const k = data.kpis;
  const maxPie = max(pieRows, (r) => r.cantidad);
  const maxBloques = max(data.bloques, (r) => r.cumplimiento);
  const maxInc = max(data.incumplidos, (r) => r.cantidad);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel QA Speech Analytics</h1>
          <p className="text-sm text-slate-500">
            Vista operativa tipo Genesys: llamadas únicas, motivos con drill-down y acceso al reproductor.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-3 shadow-sm">
          <label className="grid gap-1 text-xs font-semibold text-slate-500">
            Desde
            <input className="rounded-lg border px-3 py-2 text-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-500">
            Hasta
            <input className="rounded-lg border px-3 py-2 text-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button onClick={() => void loadData()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Aplicar
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Kpi title="Llamadas" value={n(k.total_llamadas)} />
        <Kpi title="Cumplimiento QA" value={pct(k.cumplimiento_qa)} tone="green" />
        <Kpi title="Score experiencia" value={k.score_experiencia_promedio.toFixed(1)} tone="blue" />
        <Kpi title="Riesgo reclamo" value={n(k.llamadas_riesgo_reclamo_futuro)} tone="amber" />
        <Kpi title="Riesgo abandono" value={n(k.llamadas_riesgo_abandono)} tone="amber" />
        <Kpi title="% fuga" value={pct(k.porcentaje_riesgo_fuga)} tone="red" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Motivos de contacto" subtitle="Drill-down: tipo → categoría → motivo → submotivo">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["tipo", "categoria", "motivo", "submotivo"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDrill(level)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  drill === level ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {level}
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedTipo("");
                setSelectedCategoria("");
                setSelectedMotivo("");
                setDrill("tipo");
              }}
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white"
            >
              Reiniciar drill
            </button>
          </div>

          <div className="space-y-3">
            {pieRows.map((row) => (
              <button
                key={row.label}
                onClick={() => {
                  if (drill === "tipo") {
                    setSelectedTipo(row.label);
                    setDrill("categoria");
                  } else if (drill === "categoria") {
                    setSelectedCategoria(row.label);
                    setDrill("motivo");
                  } else if (drill === "motivo") {
                    setSelectedMotivo(row.label);
                    setDrill("submotivo");
                  }
                }}
                className="grid w-full grid-cols-[220px_1fr_70px] items-center gap-3 text-left"
              >
                <span className="truncate text-sm font-semibold text-slate-700">{row.label}</span>
                <span className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-blue-500" style={{ width: `${(row.cantidad / maxPie) * 100}%` }} />
                </span>
                <span className="text-right text-sm font-bold text-slate-600">{n(row.cantidad)}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Cumplimiento por bloque" subtitle="Promedio por llamadas">
          <div className="space-y-3">
            {data.bloques.map((r) => (
              <Bar key={r.bloque} label={r.bloque} value={pct(r.cumplimiento)} width={(r.cumplimiento / maxBloques) * 100} />
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-4">
        <Panel title="Ítems más incumplidos" subtitle="COUNT DISTINCT call_id">
          <div className="space-y-3">
            {data.incumplidos.map((r) => (
              <Bar key={r.subatributo} label={r.subatributo} value={n(r.cantidad)} width={(r.cantidad / maxInc) * 100} tone="red" />
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-4">
        <Panel title="Todas las llamadas" subtitle="Botón directo al reproductor">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <th className="p-3">Acción</th>
                  <th className="p-3">Call ID</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Motivo</th>
                  <th className="p-3">Submotivo</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Cumpl.</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Reclamo</th>
                  <th className="p-3">Abandono</th>
                  <th className="p-3">Fuga</th>
                  <th className="p-3">Resumen</th>
                </tr>
              </thead>
              <tbody>
                {data.detalle.map((r) => (
                  <tr key={r.call_id} className="border-b align-top last:border-0">
                    <td className="p-3">
                      <a href={r.player_url} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
                        Escuchar llamada
                      </a>
                    </td>
                    <td className="p-3 font-mono text-xs">{r.call_id}</td>
                    <td className="p-3">{r.fecha_analisis ? new Date(r.fecha_analisis).toLocaleString("es-CL") : ""}</td>
                    <td className="p-3">{r.tipo_contacto_codigo}</td>
                    <td className="p-3">{r.categoria_detectada}</td>
                    <td className="p-3">{r.motivo_detectado_nombre || r.motivo_detectado}</td>
                    <td className="p-3">{r.submotivo_detectado_nombre || r.submotivo_detectado}</td>
                    <td className="p-3">{r.nivel_cumplimiento_general}</td>
                    <td className="p-3 font-bold">{pct(r.cumplimiento_qa)}</td>
                    <td className="p-3 font-bold">{r.score_experiencia_cliente.toFixed(1)}</td>
                    <td className="p-3"><Bool value={r.riesgo_reclamo_futuro_detectado} /></td>
                    <td className="p-3"><Bool value={r.riesgo_abandono_detectado} /></td>
                    <td className="p-3"><Bool value={r.fuga_explicita_cliente_detectado} /></td>
                    <td className="max-w-[420px] p-3 text-slate-600">{r.resumen_ejecutivo}</td>
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

function Kpi({ title, value, tone = "slate" }: { title: string; value: string; tone?: "slate" | "green" | "blue" | "amber" | "red" }) {
  const color = {
    slate: "text-slate-900",
    green: "text-emerald-700",
    blue: "text-blue-700",
    amber: "text-amber-700",
    red: "text-red-700",
  }[tone];

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">{title}</h2>
        <span className="rounded-full border bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function Bar({ label, value, width, tone = "green" }: { label: string; value: string; width: number; tone?: "green" | "red" }) {
  const color = tone === "red" ? "bg-red-500" : "bg-emerald-500";
  return (
    <div className="grid grid-cols-[260px_1fr_80px] items-center gap-3">
      <div className="truncate text-sm font-medium text-slate-700">{label}</div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(2, Math.min(width, 100))}%` }} />
      </div>
      <div className="text-right text-sm font-bold text-slate-600">{value}</div>
    </div>
  );
}

function Bool({ value }: { value: boolean }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${value ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
      {value ? "Sí" : "No"}
    </span>
  );
}