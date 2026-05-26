"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface Segment {
  segment_id?: number;
  start?: number;
  end?: number;
  start_seconds?: number;
  end_seconds?: number;
  duration_seconds?: number;
  speaker?: string;
  speaker_label?: string;
  role?: string;
  text: string;
}

interface Silence {
  silence_id?: number;
  start?: number;
  end?: number;
  start_seconds?: number;
  end_seconds?: number;
  duration?: number;
  duration_seconds?: number;
  classification?: string;
}

interface QaItem {
  id_item: string;
  bloque: string;
  atributo: string;
  subatributo: string;
  criterio: string;
  resultado: string;
  evidencia: string;
  observacion: string;
  evidence_segment_ids?: number[];
  start_seconds: number | null;
  end_seconds: number | null;
  related_segments?: Segment[];
}

interface Marker {
  marker_id: string;
  type: string;
  severity: string;
  start_seconds: number;
  end_seconds?: number;
  label: string;
  data?: unknown;
}

interface CallData {
  call_id: string;
  audio_url: string;
  language: string;
  start_time: string;
  created_at: string;
  updated_at?: string;
  duration_seconds: number;
  transcript_text: string;
  vtt: string;
  srt: string;
}

interface MetricsData {
  duration_seconds: number;
  total_speech_seconds: number;
  total_silence_seconds: number;
  silence_percentage: number;
  agent_talk_time: number;
  client_talk_time: number;
  longest_silence_seconds: number;
  silence_count: number;
  critical_silence_count: number;
}

interface ApiResponse {
  ok: boolean;
  call: CallData;
  metrics: MetricsData;
  segments: Segment[];
  silences: Silence[];
  qa_items?: QaItem[];
  markers?: Marker[];
  tags?: Marker[];
  player_payload?: {
    audio?: { url?: string; duration_seconds?: number };
    transcript?: { segments?: Segment[]; vtt?: string; srt?: string };
    silences?: Silence[];
    qa_items?: QaItem[];
    markers?: Marker[];
    summary?: Record<string, unknown>;
  };
  error?: string;
}

function getStart(item: Segment | Silence | Marker): number {
  if ("start_seconds" in item && typeof item.start_seconds === "number") return item.start_seconds;
  if ("start" in item && typeof item.start === "number") return item.start;
  return 0;
}

function getEnd(item: Segment | Silence | Marker): number {
  if ("end_seconds" in item && typeof item.end_seconds === "number") return item.end_seconds;
  if ("end" in item && typeof item.end === "number") return item.end;
  return getStart(item);
}

function getDuration(item: Silence | Segment): number {
  if ("duration_seconds" in item && typeof item.duration_seconds === "number") return item.duration_seconds;
  if ("duration" in item && typeof item.duration === "number") return item.duration;
  return Math.max(0, getEnd(item) - getStart(item));
}

function getSpeaker(segment: Segment): string {
  return segment.speaker_label || segment.speaker || segment.role || "Desconocido";
}

function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function getSpeakerColor(speaker: string): string {
  const spk = speaker.toLowerCase();
  if (spk.includes("agente") || spk.includes("agent") || spk.includes("operador")) return "bg-blue-500";
  if (spk.includes("cliente") || spk.includes("customer") || spk.includes("user")) return "bg-emerald-500";
  if (spk.includes("ivr") || spk.includes("bot") || spk.includes("system")) return "bg-slate-500";
  return "bg-zinc-500";
}

function getMarkerColor(marker: Marker): string {
  if (marker.type === "qa_item") {
    if (marker.severity === "critical") return "bg-red-500";
    if (marker.severity === "success") return "bg-emerald-500";
    return "bg-zinc-500";
  }

  if (marker.severity === "critical" || marker.severity === "high") return "bg-red-500";
  if (marker.severity === "warning" || marker.severity === "medium") return "bg-amber-500";
  return "bg-violet-500";
}

function getMarkerBadgeClass(marker: Marker): string {
  if (marker.type === "qa_item") {
    if (marker.severity === "critical") return "bg-red-500/15 text-red-300 border-red-500/30";
    if (marker.severity === "success") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    return "bg-zinc-700/40 text-zinc-300 border-zinc-600/40";
  }

  if (marker.severity === "critical" || marker.severity === "high") return "bg-red-500/15 text-red-300 border-red-500/30";
  if (marker.severity === "warning" || marker.severity === "medium") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-violet-500/15 text-violet-300 border-violet-500/30";
}

function getQaBadgeClass(resultado: string): string {
  if (resultado === "cumple") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (resultado === "no_cumple") return "border-red-500/30 bg-red-500/10 text-red-300";
  return "border-zinc-700 bg-zinc-800/40 text-zinc-400";
}

export default function PlayerPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [callId, setCallId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("call_id");

    if (!id) {
      setError("No se proporcionó call_id en la URL. Use ?call_id=...");
      setLoading(false);
      return;
    }

    setCallId(id);

    fetch(`/api/speech-player?call_id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        if (!json.ok) {
          setError(json.error || "Error al cargar la llamada");
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error de red");
        setLoading(false);
      });
  }, []);

  const segments = data?.player_payload?.transcript?.segments || data?.segments || [];
  const silences = data?.player_payload?.silences || data?.silences || [];
  const qaItems = data?.player_payload?.qa_items || data?.qa_items || [];
  const markers = data?.player_payload?.markers || data?.markers || data?.tags || [];
  const call = data?.call;
  const metrics = data?.metrics;

  const totalDuration =
    duration ||
    data?.player_payload?.audio?.duration_seconds ||
    data?.player_payload?.summary?.duration_seconds as number ||
    metrics?.duration_seconds ||
    call?.duration_seconds ||
    1;

  const rawAudioUrl =
    data?.player_payload?.audio?.url ||
    call?.audio_url ||
    "";

  const audioUrl = rawAudioUrl
    ? `/api/audio-proxy?url=${encodeURIComponent(rawAudioUrl)}`
    : "";

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);

    const idx = segments.findIndex((seg) => {
      const start = getStart(seg);
      const end = getEnd(seg);
      return audio.currentTime >= start && audio.currentTime < end;
    });

    setActiveSegmentIndex(idx >= 0 ? idx : null);
  }, [segments]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || totalDuration || 0);
  }, [totalDuration]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(time, totalDuration));

    if (audio) {
      audio.currentTime = clamped;
    }

    setCurrentTime(clamped);
  }, [totalDuration]);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = timelineRef.current;
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio * totalDuration);
  }, [seekTo, totalDuration]);

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio * totalDuration);
  }, [seekTo, totalDuration]);

  const jumpToSegment = useCallback((index: number) => {
    const segment = segments[index];
    if (!segment) return;

    seekTo(getStart(segment));
    segmentRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [segments, seekTo]);

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  useEffect(() => {
    if (activeSegmentIndex !== null && segmentRefs.current[activeSegmentIndex]) {
      segmentRefs.current[activeSegmentIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeSegmentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Cargando llamada...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold mb-2">Error</h1>
          <p className="text-zinc-400 text-sm">{error}</p>
          {callId && <p className="text-zinc-600 text-xs mt-3 font-mono">{callId}</p>}
        </div>
      </div>
    );
  }

  if (!data || !call || !metrics) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-zinc-400 text-sm">No se encontraron datos.</p>
        </div>
      </div>
    );
  }

  const speechTime = metrics.total_speech_seconds || Math.max(0, metrics.agent_talk_time + metrics.client_talk_time);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Speech Analytics Player</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Call ID: <span className="font-mono text-zinc-300">{call.call_id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{call.created_at ? new Date(call.created_at).toLocaleString("es-CL") : ""}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">
              {call.language || "es"}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full mb-3"
            controls
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center hover:bg-cyan-400 transition-colors shrink-0"
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            <div className="flex-1">
              <div
                ref={progressBarRef}
                onClick={handleProgressBarClick}
                className="h-2 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <MetricCard label="Duración" value={formatTime(metrics.duration_seconds || totalDuration)} />
          <MetricCard label="Silencio" value={`${Number(metrics.silence_percentage || 0).toFixed(1)}%`} accent="text-violet-400" />
          <MetricCard label="Tiempo Agente" value={formatTime(metrics.agent_talk_time)} accent="text-blue-400" />
          <MetricCard label="Tiempo Cliente" value={formatTime(metrics.client_talk_time)} accent="text-emerald-400" />
          <MetricCard label="Silencio más largo" value={`${Number(metrics.longest_silence_seconds || 0).toFixed(1)}s`} />
          <MetricCard label="Cantidad silencios" value={String(metrics.silence_count || silences.length)} />
          <MetricCard label="Silencios críticos" value={String(metrics.critical_silence_count || silences.filter(s => s.classification === "silencio_critico").length)} accent="text-red-400" />
          <MetricCard label="Tiempo hablado" value={formatTime(speechTime)} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <h2 className="text-sm font-medium text-zinc-300">Línea de tiempo</h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Agente</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Cliente</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" />Silencio</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />No cumple</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Cumple</span>
            </div>
          </div>

          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="relative h-16 bg-zinc-950 rounded-lg border border-zinc-800 cursor-pointer overflow-hidden select-none"
          >
            {segments.map((seg, i) => {
              const start = getStart(seg);
              const end = getEnd(seg);
              const left = (start / totalDuration) * 100;
              const width = Math.max(((end - start) / totalDuration) * 100, 0.3);
              const speaker = getSpeaker(seg);

              return (
                <div
                  key={`seg-${i}`}
                  title={`${speaker}: ${seg.text}`}
                  className={`absolute top-0 h-full ${getSpeakerColor(speaker)} opacity-60 hover:opacity-100 transition-opacity`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}

            {silences.map((sil, i) => {
              const start = getStart(sil);
              const durationSil = getDuration(sil);
              const left = (start / totalDuration) * 100;
              const width = Math.max((durationSil / totalDuration) * 100, 0.3);

              return (
                <div
                  key={`sil-${i}`}
                  title={`${sil.classification || "Silencio"}: ${durationSil.toFixed(1)}s`}
                  className="absolute top-0 h-full bg-violet-500/40 border border-violet-500/50 hover:bg-violet-500/60 transition-colors"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}

            {markers.map((marker, i) => {
              const left = (marker.start_seconds / totalDuration) * 100;

              return (
                <button
                  key={`marker-${marker.marker_id || i}`}
                  title={marker.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekTo(marker.start_seconds);
                  }}
                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${getMarkerColor(marker)} border-2 border-zinc-950 hover:scale-125 transition-transform z-10`}
                  style={{ left: `calc(${left}% - 6px)` }}
                />
              );
            })}

            <div
              className="absolute top-0 h-full w-0.5 bg-cyan-400 z-20 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {markers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {markers.slice(0, 80).map((marker, i) => (
                <button
                  key={`tag-${marker.marker_id || i}`}
                  onClick={() => seekTo(marker.start_seconds)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors hover:bg-white/5 ${getMarkerBadgeClass(marker)}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${getMarkerColor(marker)}`} />
                  {marker.label}
                  <span className="text-zinc-500 ml-1">{formatTime(marker.start_seconds)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Transcripción</h2>

            <div className="space-y-2 max-h-[40rem] overflow-y-auto pr-1">
              {segments.map((seg, i) => {
                const isActive = activeSegmentIndex === i;
                const speaker = getSpeaker(seg);
                const start = getStart(seg);
                const end = getEnd(seg);

                return (
                  <div
                    key={`seg-row-${i}`}
                    ref={(el) => {
                      segmentRefs.current[i] = el;
                    }}
                    onClick={() => jumpToSegment(i)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                      isActive
                        ? "bg-zinc-800/80 border-cyan-500/40"
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="shrink-0 pt-0.5">
                      <div className={`w-2 h-2 rounded-full ${getSpeakerColor(speaker)}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-zinc-400 uppercase">{speaker}</span>
                        <span className="text-xs text-zinc-600">{formatTime(start)} - {formatTime(end)}</span>
                      </div>

                      <p className="text-sm text-zinc-200 leading-relaxed">{seg.text}</p>
                    </div>
                  </div>
                );
              })}

              {segments.length === 0 && (
                <p className="text-zinc-500 text-sm">No hay segmentos disponibles.</p>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-zinc-300">Pauta de calidad</h2>
              <span className="text-xs text-zinc-500">{qaItems.length} ítems</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <MetricMini label="Cumple" value={qaItems.filter(i => i.resultado === "cumple").length} className="text-emerald-300" />
              <MetricMini label="No cumple" value={qaItems.filter(i => i.resultado === "no_cumple").length} className="text-red-300" />
              <MetricMini label="No aplica" value={qaItems.filter(i => i.resultado === "no_aplica").length} className="text-zinc-400" />
            </div>

            <div className="space-y-2 max-h-[40rem] overflow-y-auto pr-1">
              {qaItems.map((item) => {
                const color = getQaBadgeClass(item.resultado);

                return (
                  <button
                    key={item.id_item}
                    onClick={() => {
                      if (typeof item.start_seconds === "number") {
                        seekTo(item.start_seconds);
                      }
                    }}
                    className={`w-full text-left border rounded-lg p-3 transition-colors hover:bg-zinc-800 ${color}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-mono text-zinc-400">{item.id_item}</div>
                        <div className="text-sm font-semibold text-zinc-100 leading-tight">{item.subatributo || item.id_item}</div>
                      </div>

                      <span className="text-[10px] font-bold uppercase shrink-0">{item.resultado}</span>
                    </div>

                    <div className="text-xs text-zinc-400 mt-1">
                      {item.bloque} / {item.atributo}
                    </div>

                    {item.evidencia && (
                      <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                        {item.evidencia}
                      </p>
                    )}

                    {item.observacion && (
                      <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                        Obs: {item.observacion}
                      </p>
                    )}

                    {typeof item.start_seconds === "number" && (
                      <div className="text-xs text-cyan-400 mt-2">
                        Ver evidencia en audio: {formatTime(item.start_seconds)}
                      </div>
                    )}
                  </button>
                );
              })}

              {qaItems.length === 0 && (
                <p className="text-zinc-500 text-sm">No hay ítems QA disponibles.</p>
              )}
            </div>
          </div>
        </div>

        {call.transcript_text && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
            <h2 className="text-sm font-medium text-zinc-300 mb-3">Transcripción completa</h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{call.transcript_text}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${accent || "text-zinc-100"}`}>{value}</p>
    </div>
  );
}

function MetricMini({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2">
      <p className={`text-lg font-semibold ${className || "text-zinc-100"}`}>{value}</p>
      <p className="text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}