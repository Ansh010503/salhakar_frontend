#!/bin/bash

# Test script to download PDF from backend and check file size
# Usage: ./test-pdf-download.sh <judgment_id> [token]

API_BASE_URL="https://unquestioned-gunnar-medially.ngrok-free.dev"
JUDGMENT_ID=${1:-"1"}  # Default to judgment ID 1 if not provided
TOKEN=${2:-""}  # Optional token

echo "Testing PDF download from backend..."
echo "Judgment ID: $JUDGMENT_ID"
echo "API URL: $API_BASE_URL"

# Build curl command
CURL_CMD="curl -X GET \"${API_BASE_URL}/api/judgements/${JUDGMENT_ID}?format=pdf\""

# Add headers
CURL_CMD="$CURL_CMD -H \"Accept: application/pdf\""
CURL_CMD="$CURL_CMD -H \"ngrok-skip-browser-warning: true\""

# Add token if provided
if [ -n "$TOKEN" ]; then
  CURL_CMD="$CURL_CMD -H \"Authorization: Bearer $TOKEN\""
fi

# Output to file and show size
CURL_CMD="$CURL_CMD -o test_judgment_${JUDGMENT_ID}.pdf -w \"\nHTTP Status: %{http_code}\nSize: %{size_download} bytes (%.2f KB)\nTime: %{time_total}s\n\""

echo ""
echo "Executing curl command..."
echo ""
eval $CURL_CMD

# Check if file was created and show size
if [ -f "test_judgment_${JUDGMENT_ID}.pdf" ]; then
  FILE_SIZE=$(stat -f%z "test_judgment_${JUDGMENT_ID}.pdf" 2>/dev/null || stat -c%s "test_judgment_${JUDGMENT_ID}.pdf" 2>/dev/null)
  FILE_SIZE_KB=$((FILE_SIZE / 1024))
  FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1024 / 1024" | bc)
  
  echo ""
  echo "✅ PDF downloaded successfully!"
  echo "File: test_judgment_${JUDGMENT_ID}.pdf"
  echo "Size: $FILE_SIZE bytes ($FILE_SIZE_KB KB / $FILE_SIZE_MB MB)"
  
  # Check if it's a valid PDF
  if file "test_judgment_${JUDGMENT_ID}.pdf" | grep -q "PDF"; then
    echo "✅ Valid PDF file"
  else
    echo "⚠️  Warning: File may not be a valid PDF"
  fi
else
  echo "❌ PDF file was not created"
fi

