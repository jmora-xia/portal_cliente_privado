# Deploy QIA Dashboard / Speech Player

Esta carpeta es la versión unificada para usar como base oficial.

## Rutas principales

- Reproductor: `app/player/page.tsx`
- API BigQuery: `app/api/speech-player/route.ts`
- Proxy de audio: `app/api/audio-proxy/route.ts`

## VM actual

- Carpeta activa: `/var/www/qia-dashboard`
- Proceso PM2: `qia-dashboard`
- Puerto interno: `3002`
- Dominio: `https://qia.experienciacx.com`

## Comandos en local / Windsurf

```bash
npm install
npm run build
git add .
git commit -m "Unifica QIA dashboard con speech player"
git push
```

## Comandos en VM

```bash
cd /var/www/qia-dashboard
git pull
npm install
npm run build
pm2 restart qia-dashboard
```

## Prueba del reproductor

```text
https://qia.experienciacx.com/player?call_id=CALL_ID
```

## BigQuery requerido

Tabla: `xia-speech-15062026.speech_analytics.speech_analytics_timeline`

Columnas mínimas para player:

- `call_id` STRING
- `audio_url` STRING
- `duration_seconds` FLOAT64
- `total_speech_seconds` FLOAT64
- `total_silence_seconds` FLOAT64
- `silence_percentage` FLOAT64
- `agent_talk_time` FLOAT64
- `client_talk_time` FLOAT64
- `longest_silence_seconds` FLOAT64
- `silence_count` INT64
- `critical_silence_count` INT64
- `analysis_version` STRING
- `player_payload_json` STRING
- `silences_json` STRING
- `qa_items_json` STRING
- `markers_json` STRING
- `total_segments` INT64
- `total_silences` INT64
- `total_qa_items` INT64
- `total_markers` INT64
- `updated_at` TIMESTAMP
```
