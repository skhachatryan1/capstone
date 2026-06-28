#!/bin/bash
(
NEXUS_SERVICE_URL="http://apex-loadbalancer.apex-nexus.svc.cluster.local:8081"
API_ENDPOINT="$NEXUS_SERVICE_URL/service/rest/v1/repositories/docker/hosted"

until curl -s --connect-timeout 2 "$NEXUS_SERVICE_URL/service/rest/v1/status" | grep -q "writable"; do
    echo "Nexus API is not ready yet. Retrying in 15 seconds..."
    sleep 15
done

PASSWORD="admin123"

read -r -d '' JSON_PAYLOAD << 'EOF'
{
  "name": "internal",
  "online": true,
  "storage": {
    "blobStoreName": "default",
    "strictContentTypeValidation": true,
    "writePolicy": "ALLOW_ONCE",
    "latestPolicy": true
  },
  "cleanup": {
    "policyNames": []
  },
  "component": {
    "proprietaryComponents": true
  },
  "docker": {
    "v1Enabled": false,
    "forceBasicAuth": true,
    "httpPort": 8082,
    "httpsPort": 8083,
    "subdomain": "docker-a",
    "pathEnabled": true
  }
}
EOF

curl -X POST "$API_ENDPOINT" \
     -u "admin:$PASSWORD" \
     -H "Content-Type: application/json" \
     -d "$JSON_PAYLOAD"
)&