#!/bin/bash
while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/ping)

    if [[ $response -ge 200 && $response -lt 300 ]]; then
        echo "[e2e] Server is up! Responded with status: $response"
        break
    else
        echo "[e2e] Waiting for server... Status: $response"
        sleep 1
    fi
done
