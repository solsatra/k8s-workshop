#!/usr/bin/env bash
# Facilitator script for the chaos round (exercise 7).
# Injects one randomly-chosen bug from manifests/chaos/ into each player
# namespace, overwriting the matching snake-core Deployment or Service.
# Run this only after everyone has a healthy deploy from exercises 2-4.
#
# Usage: ./apply-chaos.sh alice bob carol ...
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAOS_DIR="${SCRIPT_DIR}/../manifests/chaos"

if [ "$#" -eq 0 ]; then
  echo "usage: $0 <namespace> [namespace...]" >&2
  exit 1
fi

mapfile -t BUGS < <(ls "${CHAOS_DIR}"/*.yaml)

for ns in "$@"; do
  bug="${BUGS[$((RANDOM % ${#BUGS[@]}))]}"
  echo "Injecting $(basename "${bug}") into namespace ${ns}"
  kubectl apply -n "${ns}" -f "${bug}"
done

echo
echo "Answer key stays in ${CHAOS_DIR} — don't show these files to players."
