/**
 * Speech Analytics Player API
 *
 * Nota tecnica (autenticacion):
 * Esta API usa Application Default Credentials (ADC) del entorno Google Cloud.
 * No requiere archivo JSON de clave de cuenta de servicio.
 *
 * En produccion (por ejemplo, una VM de Compute Engine), la VM debe tener
 * una cuenta de servicio asociada con estos permisos sobre BigQuery:
 *   - BigQuery Data Viewer
 *   - BigQuery Job User
 *
 * Para verificar la cuenta de servicio de la VM:
 *   curl -H "Metadata-Flavor: Google" \
 *     "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email"
 */

/**
 * Speech Analytics Player API
 */

import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

function safeDateToIso(value: unknown): string {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && value !== null && "value" in value) {
    const date = new Date(String((value as { value: unknown }).value));
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function safeJsonParse(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }

      return null;
    } catch {
      return null;
    }
  }

  return null;
}

function getBigQueryClient(): BigQuery {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "xia-speech-15062026";
  return new BigQuery({ projectId });
}

function getPayloadArray(payload: Record<string, unknown>, key: string): unknown[] {
  const value = payload[key];
  return Array.isArray(value) ? value : [];
}

function getNestedSegments(payload: Record<string, unknown>): unknown[] {
  const transcript = payload.transcript;

  if (
    transcript &&
    typeof transcript === "object" &&
    !Array.isArray(transcript) &&
    Array.isArray((transcript as Record<string, unknown>).segments)
  ) {
    return (transcript as Record<string, unknown>).segments as unknown[];
  }

  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get("call_id");

    if (!callId) {
      return NextResponse.json(
        { ok: false, error: "call_id es requerido" },
        { status: 400 }
      );
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "xia-speech-15062026";
    const dataset = process.env.BIGQUERY_DATASET || "speech_analytics";
    const table = process.env.BIGQUERY_TIMELINE_TABLE || "speech_analytics_timeline";

    const bq = getBigQueryClient();

    const query = `
      SELECT
        call_id,
        audio_url,
        language,
        start_time,
        created_at,
        updated_at,
        duration_seconds,
        total_speech_seconds,
        total_silence_seconds,
        silence_percentage,
        agent_talk_time,
        client_talk_time,
        longest_silence_seconds,
        silence_count,
        critical_silence_count,
        transcript_text,
        vtt,
        srt,
        player_payload_json
      FROM \`${projectId}.${dataset}.${table}\`
      WHERE call_id = @call_id
        AND player_payload_json IS NOT NULL
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1
    `;

    const [rows] = await bq.query({
      query,
      params: { call_id: callId },
    });

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Llamada no encontrada o sin player_payload_json" },
        { status: 404 }
      );
    }

    const row = rows[0] as Record<string, unknown>;
    const payload = safeJsonParse(row.player_payload_json);

    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "player_payload_json inválido" },
        { status: 500 }
      );
    }

    const payloadDuration = Number(payload.duration_seconds ?? 0) || 0;
    const rowDuration = Number(row.duration_seconds ?? 0) || 0;

    const segments = getNestedSegments(payload);
    const silences = getPayloadArray(payload, "silences");
    const qaItems = getPayloadArray(payload, "qa_items");
    const markers = getPayloadArray(payload, "markers");

    return NextResponse.json({
      ok: true,
      call: {
        call_id: String(row.call_id ?? ""),
        audio_url: String(row.audio_url ?? ""),
        language: String(row.language ?? ""),
        start_time: safeDateToIso(row.start_time),
        created_at: safeDateToIso(row.created_at),
        updated_at: safeDateToIso(row.updated_at),
        duration_seconds: rowDuration || payloadDuration,
        transcript_text: String(row.transcript_text ?? ""),
        vtt: String(row.vtt ?? ""),
        srt: String(row.srt ?? ""),
      },
      metrics: {
        duration_seconds: rowDuration || payloadDuration,
        total_speech_seconds: Number(row.total_speech_seconds ?? 0) || 0,
        total_silence_seconds: Number(row.total_silence_seconds ?? 0) || 0,
        silence_percentage: Number(row.silence_percentage ?? 0) || 0,
        agent_talk_time: Number(row.agent_talk_time ?? 0) || 0,
        client_talk_time: Number(row.client_talk_time ?? 0) || 0,
        longest_silence_seconds: Number(row.longest_silence_seconds ?? 0) || 0,
        silence_count: Number(row.silence_count ?? 0) || silences.length,
        critical_silence_count: Number(row.critical_silence_count ?? 0) || 0,
      },
      player_payload: payload,
      segments,
      silences,
      qa_items: qaItems,
      markers,
      tags: markers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    console.error("[speech-player] error:", error);

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}