#!/usr/bin/env bash
# One-time setup on a new computer (Linux or macOS). Safe to rerun: it only installs what is missing.
# Usage: bash scripts/setup.sh
# Ends with a status block: anything under "NEEDS" (API key) must be added to .env.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)

need() { command -v "$1" >/dev/null 2>&1; }
install_pkg() {  # install_pkg <pacman name> <brew name> <apt name>
  if need pacman; then sudo pacman -S --needed --noconfirm "$1"
  elif need brew; then brew install "$2"
  elif need apt-get; then sudo apt-get install -y "$3"
  else echo "install $1 by hand"; return 1; fi
}

need git     || install_pkg git git git
need node    || install_pkg nodejs node nodejs
need npm     || install_pkg npm node npm
need ffmpeg  || install_pkg ffmpeg ffmpeg ffmpeg
need yt-dlp  || install_pkg yt-dlp yt-dlp yt-dlp
need python3 || install_pkg python python python3-venv

echo "· node packages"; npm ci --silent
echo "· python venv"; [ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

echo "· Claude skills"; mkdir -p ~/.claude/skills
for l in ~/.claude/skills/*; do [ -L "$l" ] && [ ! -e "$l" ] && case "$(readlink "$l")" in "$ROOT"/*) rm "$l";; esac; done
for s in .claude/skills/*/; do ln -sfn "$ROOT/$s" ~/.claude/skills/"$(basename "$s")"; done

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  chmod 600 .env
else
  touch .env; chmod 600 .env
fi

missing=()
for k in GEMINI_API_KEY; do grep -qE "^$k=.+" .env || missing+=("$k"); done
echo; echo "== setup done =="
[ ${#missing[@]} -eq 0 ] && echo "OK  .env keys" || echo "NEEDS .env: ${missing[*]} (add GEMINI_API_KEY=... to $ROOT/.env; free Gemini key at aistudio.google.com, optional POSTIZ_API_KEY at platform.postiz.com)"
