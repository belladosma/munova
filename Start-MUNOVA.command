#!/bin/bash
cd "$(dirname "$0")"
( python3 -m http.server 8765 --bind 127.0.0.1 ) &
SERVER_PID=$!
sleep 1
open http://127.0.0.1:8765
echo "MUNOVA está en http://127.0.0.1:8765. Deja esta ventana abierta para mantener el servidor."
wait "$SERVER_PID"
