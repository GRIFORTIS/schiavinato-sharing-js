#!/bin/bash
#
# Verify SHA256 checksums for @grifortis/schiavinato-sharing
#
# Usage:
#   ./scripts/verify-checksums.sh [version]
#
# Example:
#   ./scripts/verify-checksums.sh v0.1.0
#

set -e

VERSION="${1:-latest}"
REPO="GRIFORTIS/schiavinato-sharing-js"
CHECKSUMS_FILE="CHECKSUMS-LIBRARY.txt"

echo "🔐 Verifying checksums for @grifortis/schiavinato-sharing"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Download checksums from GitHub release
echo "📥 Downloading checksums for version: ${VERSION}"
if [ "$VERSION" = "latest" ]; then
  CHECKSUM_URL="https://github.com/${REPO}/releases/latest/download/${CHECKSUMS_FILE}"
else
  CHECKSUM_URL="https://github.com/${REPO}/releases/download/${VERSION}/${CHECKSUMS_FILE}"
fi

echo "   URL: ${CHECKSUM_URL}"
echo ""

# Download checksums file
if curl -fSL -o "${CHECKSUMS_FILE}" "$CHECKSUM_URL"; then
  echo -e "${GREEN}✓${NC} Downloaded ${CHECKSUMS_FILE}"
else
  echo -e "${RED}✗${NC} Failed to download checksums"
  echo "   Make sure the release exists and has checksums attached"
  exit 1
fi

echo ""
echo "📝 Checksums file content:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "${CHECKSUMS_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo -e "${YELLOW}⚠${NC}  dist/ directory not found"
  echo "   Run 'npm run build' first"
  exit 1
fi

# Verify checksums
echo "🔍 Verifying checksums..."
echo ""

cd dist

FAILED=0
PASSED=0

while IFS= read -r line; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^#.* || "$line" =~ ^Version:.* || "$line" =~ ^Generated:.* || "$line" =~ ^##.* || "$line" =~ ^To\ verify.* || "$line" =~ ^\ \ sha256sum.* ]] && continue
  
  # Extract checksum and filename
  EXPECTED_HASH=$(echo "$line" | awk '{print $1}')
  FILENAME=$(echo "$line" | awk '{print $2}')
  
  ACTUAL_FILE="$FILENAME"
  # Backward-compat: some releases may list the browser bundle filename without path.
  # If the file isn't in dist/, try dist/browser/.
  if [ ! -f "$ACTUAL_FILE" ] && [ -f "browser/$ACTUAL_FILE" ]; then
    ACTUAL_FILE="browser/$ACTUAL_FILE"
  fi
  
  if [ -f "$ACTUAL_FILE" ]; then
    ACTUAL_HASH=$(sha256sum "$ACTUAL_FILE" | awk '{print $1}')
    
    if [ "$EXPECTED_HASH" = "$ACTUAL_HASH" ]; then
      echo -e "${GREEN}✓${NC} $ACTUAL_FILE"
      ((PASSED++))
    else
      echo -e "${RED}✗${NC} $ACTUAL_FILE"
      echo "   Expected: $EXPECTED_HASH"
      echo "   Got:      $ACTUAL_HASH"
      ((FAILED++))
    fi
  else
    echo -e "${YELLOW}⚠${NC}  $ACTUAL_FILE (not found)"
  fi
done < ../"${CHECKSUMS_FILE}"

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results:"
echo -e "  ${GREEN}Passed:${NC} $PASSED"
echo -e "  ${RED}Failed:${NC} $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo -e "${RED}✗ Checksum verification FAILED${NC}"
  echo "  Some files do not match the expected checksums."
  echo "  This could indicate tampering or corruption."
  exit 1
else
  echo ""
  echo -e "${GREEN}✓ All checksums verified successfully!${NC}"
  echo "  The files are authentic and have not been modified."
  exit 0
fi

