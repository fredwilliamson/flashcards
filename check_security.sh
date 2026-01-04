#!/bin/bash

# Security Checklist Script
# Run before deploying to production

echo "🔐 FlashCard API - Security Checklist"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: .env file exists and not in git
echo "1. Checking .env configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    if grep -q ".env" .gitignore 2>/dev/null; then
        echo -e "${GREEN}✓${NC} .env is in .gitignore"
    else
        echo -e "${RED}✗${NC} WARNING: .env not in .gitignore!"
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
fi

# Check 2: SECRET_KEY strength
echo ""
echo "2. Checking SECRET_KEY strength..."
if [ -f ".env" ]; then
    SECRET_KEY=$(grep "^SECRET_KEY=" .env | cut -d '=' -f2)
    KEY_LENGTH=${#SECRET_KEY}
    
    if [ $KEY_LENGTH -ge 32 ]; then
        echo -e "${GREEN}✓${NC} SECRET_KEY length: $KEY_LENGTH characters (good)"
    else
        echo -e "${RED}✗${NC} SECRET_KEY too short: $KEY_LENGTH characters (minimum 32 recommended)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check: .env not found"
fi

# Check 3: DEBUG mode
echo ""
echo "3. Checking DEBUG mode..."
if [ -f ".env" ]; then
    DEBUG=$(grep "^DEBUG=" .env | cut -d '=' -f2)
    
    if [ "$DEBUG" == "False" ] || [ "$DEBUG" == "false" ] || [ -z "$DEBUG" ]; then
        echo -e "${GREEN}✓${NC} DEBUG is disabled (production-ready)"
    else
        echo -e "${YELLOW}⚠${NC} DEBUG is enabled (should be False in production)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check: .env not found"
fi

# Check 4: ALLOWED_ORIGINS
echo ""
echo "4. Checking CORS configuration..."
if [ -f ".env" ]; then
    ORIGINS=$(grep "^ALLOWED_ORIGINS=" .env | cut -d '=' -f2)
    
    if [[ $ORIGINS == *"*"* ]]; then
        echo -e "${RED}✗${NC} ALLOWED_ORIGINS contains wildcard (*) - SECURITY RISK!"
    elif [ -z "$ORIGINS" ]; then
        echo -e "${RED}✗${NC} ALLOWED_ORIGINS is empty"
    else
        echo -e "${GREEN}✓${NC} ALLOWED_ORIGINS configured: $ORIGINS"
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check: .env not found"
fi

# Check 5: No hardcoded secrets in code
echo ""
echo "5. Scanning for hardcoded secrets..."
SECRETS_FOUND=0

# Check for potential secrets
if grep -r "password.*=.*['\"]" app/ --include="*.py" 2>/dev/null | grep -v "password: str" | grep -q .; then
    echo -e "${YELLOW}⚠${NC} Potential hardcoded passwords found"
    SECRETS_FOUND=1
fi

if grep -r "secret.*=.*['\"]" app/ --include="*.py" 2>/dev/null | grep -v "SECRET_KEY" | grep -q .; then
    echo -e "${YELLOW}⚠${NC} Potential hardcoded secrets found"
    SECRETS_FOUND=1
fi

if grep -r "api_key.*=.*['\"]" app/ --include="*.py" 2>/dev/null | grep -q .; then
    echo -e "${YELLOW}⚠${NC} Potential hardcoded API keys found"
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No obvious hardcoded secrets found"
fi

# Check 6: SQL injection risks
echo ""
echo "6. Checking for SQL injection risks..."
if grep -r "text(" app/ --include="*.py" 2>/dev/null | grep -q .; then
    echo -e "${YELLOW}⚠${NC} Raw SQL text() found - review for SQL injection risks"
else
    echo -e "${GREEN}✓${NC} No raw SQL text() found (using ORM)"
fi

# Check 7: Dependencies vulnerabilities
echo ""
echo "7. Checking dependencies..."
if command -v pip &> /dev/null; then
    echo "Running pip check..."
    pip check > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} No dependency conflicts"
    else
        echo -e "${YELLOW}⚠${NC} Dependency conflicts found - run 'pip check' for details"
    fi
else
    echo -e "${YELLOW}⚠${NC} pip not found - cannot check dependencies"
fi

# Check 8: Rate limiting configured
echo ""
echo "8. Checking rate limiting..."
if grep -q "slowapi" requirements.txt 2>/dev/null; then
    echo -e "${GREEN}✓${NC} slowapi installed"
    
    if grep -q "@limiter.limit" app/routes/auth_route.py 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Rate limiting configured on login route"
    else
        echo -e "${RED}✗${NC} Rate limiting NOT configured on login route"
    fi
else
    echo -e "${RED}✗${NC} slowapi not in requirements.txt"
fi

# Check 9: Security headers
echo ""
echo "9. Checking security headers middleware..."
if [ -f "app/middleware/security.py" ]; then
    echo -e "${GREEN}✓${NC} Security middleware file exists"
    
    if grep -q "SecurityHeadersMiddleware" app/main.py 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Security headers enabled in main.py"
    else
        echo -e "${RED}✗${NC} Security headers NOT enabled in main.py"
    fi
else
    echo -e "${RED}✗${NC} Security middleware not found"
fi

# Check 10: Argon2 for passwords
echo ""
echo "10. Checking password hashing..."
if grep -q "argon2" requirements.txt 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Argon2 installed"
    
    if grep -q "argon2" app/services/impl/user_service_impl.py 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Argon2 configured in user service"
    else
        echo -e "${YELLOW}⚠${NC} Argon2 installed but not found in user service"
    fi
else
    echo -e "${RED}✗${NC} Argon2 not in requirements.txt"
fi

# Summary
echo ""
echo "======================================"
echo "📊 Security Check Complete"
echo ""
echo "⚠️  Review any warnings above before deploying to production"
echo ""
echo "🔗 For more info, see: backend/SECURITY.md"



