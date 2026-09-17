#!/bin/sh
set -eu
# Montage des médias de démonstration fournis, pas une fausse session utilisateur.
ffmpeg -y -loop 1 -i public/assets/hero-poster.webp -vf "scale=1440:900,crop=1280:800:x='80+30*sin(t*0.785398)':y='50+20*cos(t*0.785398)',scale=1280:800,format=yuv420p" -t 8 -r 24 -an -c:v libx264 -preset slow -crf 28 -movflags +faststart public/assets/hero-desktop.mp4
ffmpeg -y -loop 1 -i public/assets/media/nomad-essentials.webp -vf "scale=800:-2,crop=640:1136:x='80+20*sin(t*0.785398)':y='100+15*cos(t*0.785398)',format=yuv420p" -t 8 -r 24 -an -c:v libx264 -preset slow -crf 28 -movflags +faststart public/assets/hero-mobile.mp4
