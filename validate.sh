#!/bin/bash

echo "======================================"
echo "Unified Tracking Package Validation"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Validation results
ERRORS=0

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        ERRORS=$((ERRORS + 1))
    fi
}

echo ""
echo "1. Checking package.json..."
if [ -f "package.json" ]; then
    NAME=$(node -p "require('./package.json').name")
    VERSION=$(node -p "require('./package.json').version")
    echo "   Package: $NAME v$VERSION"
    check_status "package.json is valid"
else
    echo -e "${RED}✗${NC} package.json not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "2. Checking dependencies..."
npm ls --depth=0 > /dev/null 2>&1
check_status "Dependencies are installed"

echo ""
echo "3. Building project..."
npm run clean > /dev/null 2>&1
check_status "Clean completed"

npx tsc > /dev/null 2>&1
check_status "TypeScript compilation"

npx rollup -c rollup.config.js > /dev/null 2>&1
check_status "Rollup bundling"

echo ""
echo "4. Checking build outputs..."
[ -f "dist/esm/src/index.js" ] && check_status "ESM build exists" || (echo -e "${RED}✗${NC} ESM build missing" && ERRORS=$((ERRORS + 1)))
[ -f "dist/esm/src/index.d.ts" ] && check_status "TypeScript definitions exist" || (echo -e "${RED}✗${NC} TypeScript definitions missing" && ERRORS=$((ERRORS + 1)))
[ -f "dist/plugin.js" ] && check_status "UMD bundle exists" || (echo -e "${RED}✗${NC} UMD bundle missing" && ERRORS=$((ERRORS + 1)))

echo ""
echo "5. Checking exports..."
[ -d "dist/esm/src/react" ] && check_status "React exports exist" || (echo -e "${RED}✗${NC} React exports missing" && ERRORS=$((ERRORS + 1)))
[ -d "dist/esm/src/capacitor" ] && check_status "Capacitor exports exist" || (echo -e "${RED}✗${NC} Capacitor exports missing" && ERRORS=$((ERRORS + 1)))

echo ""
echo "6. Checking native implementations..."
[ -d "android/src/main/java/com/aoneahsan/unifiedtracking" ] && check_status "Android implementation exists" || (echo -e "${RED}✗${NC} Android implementation missing" && ERRORS=$((ERRORS + 1)))
[ -d "ios/Sources/UnifiedTrackingPlugin" ] && check_status "iOS implementation exists" || (echo -e "${RED}✗${NC} iOS implementation missing" && ERRORS=$((ERRORS + 1)))

echo ""
echo "7. Checking documentation..."
[ -f "README.md" ] || [ -f "Readme.md" ] && check_status "README exists" || (echo -e "${RED}✗${NC} README missing" && ERRORS=$((ERRORS + 1)))
[ -f "CONTRIBUTING.md" ] && check_status "CONTRIBUTING.md exists" || (echo -e "${RED}✗${NC} CONTRIBUTING.md missing" && ERRORS=$((ERRORS + 1)))
[ -d "docs" ] && check_status "Documentation folder exists" || (echo -e "${RED}✗${NC} Documentation folder missing" && ERRORS=$((ERRORS + 1)))

echo ""
echo "8. Checking package files..."
[ -f ".npmignore" ] && check_status ".npmignore exists" || (echo -e "${RED}✗${NC} .npmignore missing" && ERRORS=$((ERRORS + 1)))
[ -f "LICENSE" ] && check_status "LICENSE exists" || (echo -e "${RED}✗${NC} LICENSE missing" && ERRORS=$((ERRORS + 1)))

echo ""
echo "9. Checking CLI tool..."
[ -f "bin/setup.js" ] && check_status "CLI setup tool exists" || (echo -e "${RED}✗${NC} CLI setup tool missing" && ERRORS=$((ERRORS + 1)))

echo ""
echo "10. Package size check..."
SIZE=$(du -sh dist | cut -f1)
echo "   Build size: $SIZE"
check_status "Build size calculated"

echo ""
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "The package is ready for publishing."
else
    echo -e "${RED}✗ Found $ERRORS error(s)${NC}"
    echo "Please fix the issues before publishing."
fi
echo "======================================"

exit $ERRORS