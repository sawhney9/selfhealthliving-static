#!/bin/bash
set -e
# Assemble rendered scenes into a vertical reel with Ken Burns zoom + crossfades.
# usage: build_video.sh <scene_dir> <n_scenes> <output.mp4> [ffmpeg_path]
DIR="$1"; N="$2"; OUTFILE="$3"; FF="${4:-ffmpeg}"
# Seconds each scene is on screen and crossfade length. Longer DUR = more time to
# read the card. Override with REEL_DUR / REEL_XF env vars.
DUR="${REEL_DUR:-4.8}"; XF="${REEL_XF:-0.6}"; FR=30
cd "$DIR"

for i in $(seq 0 $((N-1))); do
  "$FF" -y -loglevel error -loop 1 -framerate $FR -t $DUR -i s$i.png \
    -vf "scale=2160:3840,zoompan=z='min(1+0.00065*on,1.09)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=$FR,format=yuv420p" \
    -an -c:v libx264 -preset medium -crf 21 clip$i.mp4
done
echo "  clips rendered ($N)"

INPUTS=""; for i in $(seq 0 $((N-1))); do INPUTS="$INPUTS -i clip$i.mp4"; done
FILTER=""; PREV="0:v"
for i in $(seq 1 $((N-1))); do
  OFF=$(python3 -c "print(round($i*($DUR-$XF),3))")
  FILTER="$FILTER[$PREV][$i:v]xfade=transition=fade:duration=$XF:offset=$OFF[x$i];"
  PREV="x$i"
done
FILTER="${FILTER%;}"

"$FF" -y -loglevel error $INPUTS -filter_complex "$FILTER" -map "[$PREV]" \
  -an -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart "$OUTFILE"
"$FF" -i "$OUTFILE" 2>&1 | grep Duration
