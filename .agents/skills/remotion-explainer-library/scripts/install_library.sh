#!/usr/bin/env bash
# Copies the Remotion Explainer Component Library (180+ components, 104 icons, theme, layout, timing, and Studio showcases)
# into a target Remotion project directory.
# Usage: bash install_library.sh /path/to/target-remotion-project

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: bash $0 /path/to/target-remotion-project"
  exit 1
fi

TARGET="$(cd "$1" && pwd)"
REPO_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"

if [ ! -d "$REPO_ROOT/src/components" ]; then
  echo "Error: Could not find src/components in $REPO_ROOT"
  exit 1
fi

mkdir -p "$TARGET/src/brand" "$TARGET/src/lib" "$TARGET/src/icons" "$TARGET/src/components" "$TARGET/src/library" "$TARGET/public/sfx"

cp -r "$REPO_ROOT/src/theme.ts" "$TARGET/src/"
cp -r "$REPO_ROOT/src/layout.ts" "$TARGET/src/"
cp -r "$REPO_ROOT/src/brand/"* "$TARGET/src/brand/"
cp -r "$REPO_ROOT/src/lib/"* "$TARGET/src/lib/"
cp -r "$REPO_ROOT/src/icons/"* "$TARGET/src/icons/"
cp -r "$REPO_ROOT/src/components/"* "$TARGET/src/components/"
cp -r "$REPO_ROOT/src/library/"* "$TARGET/src/library/"
cp -r "$REPO_ROOT/public/sfx/"* "$TARGET/public/sfx/" 2>/dev/null || true

echo "Installed Remotion Explainer Component Library (180+ components, 104 icons, theme, layout, timing) into $TARGET/src"
echo "Ensure 'qrcode' and '@types/qrcode' are installed in $TARGET/package.json."
