#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src/assets/video"
OUT_DIR="$ROOT_DIR/public/video"
TARGETS=("home-hero" "methodology-hero")
FFMPEG_BIN=""

print_status() {
  echo "Hero video variants:"
  for target in "${TARGETS[@]}"; do
    for ext in webm mp4; do
      local file_path="$OUT_DIR/${target}-mobile.${ext}"
      if [[ -f "$file_path" ]]; then
        local file_size
        file_size="$(ls -lh "$file_path" | awk '{ print $5 }')"
        echo "  - ${target}-mobile.${ext}: ${file_size}"
      else
        echo "  - ${target}-mobile.${ext}: not found"
      fi
    done
  done
}

if [[ "${1:-}" == "--status" ]]; then
  print_status
  exit 0
fi

if command -v ffmpeg >/dev/null 2>&1; then
  FFMPEG_BIN="ffmpeg"
else
  if [[ -d "$ROOT_DIR/node_modules" ]]; then
    static_bin="$(cd "$ROOT_DIR" && node -e "process.stdout.write(require('ffmpeg-static') || '')" 2>/dev/null || true)"
    if [[ -n "${static_bin:-}" && -x "$static_bin" ]]; then
      FFMPEG_BIN="$static_bin"
    fi
  fi
fi

if [[ -z "$FFMPEG_BIN" ]]; then
  echo "Error: ffmpeg binary not found."
  echo "Options:"
  echo "  1) Install system ffmpeg (macOS): brew install ffmpeg"
  echo "  2) Use project-local binary: pnpm install && pnpm rebuild ffmpeg-static"
  echo "Then rerun: pnpm video:hero:encode"
  exit 1
fi

mkdir -p "$OUT_DIR"

WEBM_CODEC="libvpx-vp9"
if ! "$FFMPEG_BIN" -hide_banner -encoders 2>/dev/null | grep -q 'libvpx-vp9'; then
  WEBM_CODEC="libvpx"
fi

encode_target() {
  local target="$1"
  local input_path="$SRC_DIR/${target}.mp4"
  local output_mp4="$OUT_DIR/${target}-mobile.mp4"
  local output_webm="$OUT_DIR/${target}-mobile.webm"

  if [[ ! -f "$input_path" ]]; then
    echo "Skip ${target}: source not found at ${input_path}"
    return
  fi

  echo "Encoding ${target} -> mobile variants..."

  "$FFMPEG_BIN" -hide_banner -loglevel error -y \
    -i "$input_path" \
    -an \
    -vf "scale='min(960,iw)':-2,fps=24" \
    -c:v libx264 \
    -profile:v main \
    -preset slow \
    -crf 29 \
    -maxrate 900k \
    -bufsize 1800k \
    -movflags +faststart \
    "$output_mp4"

  "$FFMPEG_BIN" -hide_banner -loglevel error -y \
    -i "$input_path" \
    -an \
    -vf "scale='min(960,iw)':-2,fps=24" \
    -c:v "$WEBM_CODEC" \
    -b:v 0 \
    -crf 36 \
    -deadline good \
    -cpu-used 1 \
    -row-mt 1 \
    "$output_webm"

  local source_size
  source_size="$(ls -lh "$input_path" | awk '{ print $5 }')"
  local mp4_size
  mp4_size="$(ls -lh "$output_mp4" | awk '{ print $5 }')"
  local webm_size
  webm_size="$(ls -lh "$output_webm" | awk '{ print $5 }')"

  echo "  Source: ${source_size} (${target}.mp4)"
  echo "  Mobile MP4: ${mp4_size} (${target}-mobile.mp4)"
  echo "  Mobile WEBM: ${webm_size} (${target}-mobile.webm)"
}

for target in "${TARGETS[@]}"; do
  encode_target "$target"
done

echo
print_status
