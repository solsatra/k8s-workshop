#!/usr/bin/env bash
# Simple load generator for the HPA exercise (exercise 8).
# Usage: ./load-gen.sh <url> [duration-seconds] [concurrency]
#
# Test this against your own deploy before the workshop — a static-file
# game server may need more concurrency than you'd expect to trip a CPU-
# based HPA threshold. Adjust manifests/templates/08-hpa.yaml's
# averageUtilization accordingly.
set -euo pipefail

URL="${1:?usage: load-gen.sh <url> [duration-seconds] [concurrency]}"
DURATION="${2:-60}"
CONCURRENCY="${3:-20}"

if command -v hey >/dev/null 2>&1; then
  echo "Using hey for ${DURATION}s at concurrency ${CONCURRENCY} against ${URL}"
  hey -z "${DURATION}s" -c "${CONCURRENCY}" "${URL}"
else
  echo "hey not found, falling back to a curl loop for ${DURATION}s at concurrency ${CONCURRENCY}"
  end=$((SECONDS + DURATION))
  while [ $SECONDS -lt $end ]; do
    seq 1 "${CONCURRENCY}" | xargs -P "${CONCURRENCY}" -I{} curl -s -o /dev/null "${URL}"
  done
fi
