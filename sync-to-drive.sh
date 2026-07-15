#!/usr/bin/env bash
# Sync bangla-learn source to Google Drive (excludes node_modules, .git, build junk).
# One-time setup: authorize the "gdrive" remote first (see instructions from Claude).
# Usage:
#   ./sync-to-drive.sh          # sync (mirror) source -> Drive
#   ./sync-to-drive.sh --dry    # preview what would change, upload nothing
set -euo pipefail

REMOTE="gdrive"
DEST="Bhashaloop App/bangla-learn-source"   # folder inside your Drive
SRC="/Users/marwaanswar/bangla-learn"
FILTER="$HOME/.config/rclone/bangla-learn-filter.txt"

FLAGS=(--filter-from "$FILTER" --progress --checksum --create-empty-src-dirs)
if [[ "${1:-}" == "--dry" ]]; then
  FLAGS+=(--dry-run)
  echo "== DRY RUN — nothing will be uploaded =="
fi

rclone sync "$SRC" "${REMOTE}:${DEST}" "${FLAGS[@]}"
echo "Done. View: https://drive.google.com/drive/folders/1i41e3kXqocAt7kT6vPz2BOaXZ5NtGEx5"
