#!/bin/bash
# API Testing Script

API_URL="http://localhost:3000/api/v1"

echo "🧪 Testing Get Plot API"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test health endpoint
echo "1. Testing health endpoint..."
HEALTH=$(curl -s ${API_URL%/api/v1}/health)
if echo $HEALTH | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi
echo ""

# Test registration
echo "2. Testing user registration..."
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"password\": \"TestPass123!\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"phone\": \"+233241234567\",
    \"country\": \"Ghana\"
  }")

if echo $REGISTER_RESPONSE | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo $REGISTER_RESPONSE
    exit 1
fi
echo ""

# Test login
echo "3. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"password\": \"TestPass123!\"
  }")

if echo $LOGIN_RESPONSE | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi
echo ""

# Test get properties
echo "4. Testing get properties..."
PROPERTIES_RESPONSE=$(curl -s "$API_URL/properties?limit=5")

if echo $PROPERTIES_RESPONSE | grep -q "success"; then
    echo -e "${GREEN}✅ Get properties successful${NC}"
else
    echo -e "${RED}❌ Get properties failed${NC}"
    exit 1
fi
echo ""

# Test get user profile
echo "5. Testing get user profile..."
PROFILE_RESPONSE=$(curl -s $API_URL/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $PROFILE_RESPONSE | grep -q "success"; then
    echo -e "${GREEN}✅ Get profile successful${NC}"
else
    echo -e "${RED}❌ Get profile failed${NC}"
    exit 1
fi
echo ""

# Test properties by location
echo "6. Testing properties by location..."
LOCATION_RESPONSE=$(curl -s "$API_URL/properties/location/yabi")

if echo $LOCATION_RESPONSE | grep -q "FeatureCollection"; then
    echo -e "${GREEN}✅ Get properties by location successful${NC}"
else
    echo -e "${RED}❌ Get properties by location failed${NC}"
    exit 1
fi
echo ""

echo "======================="
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo "======================="

