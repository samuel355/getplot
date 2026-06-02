#!/usr/bin/env bash
# Starts admin API (8787) + Expo together. Ctrl+C stops both.
cd "$(dirname "$0")/.."

free_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "[start] Freeing port $port (stopping old process)..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 0.5
  fi
}

cleanup() {
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

free_port 8787

echo "[start] Admin API (port 8787)"
node server/index.mjs &
API_PID=$!
sleep 1

if ! kill -0 "$API_PID" 2>/dev/null; then
  echo "[start] Admin API failed to start. Try: lsof -ti :8787 | xargs kill -9"
  exit 1
fi

echo "[start] Expo"
exec npx expo start "$@"
