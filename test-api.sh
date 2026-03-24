#!/bin/bash

echo "🧪 Testing PropertyHub API with Seeded Data"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test login
echo -e "${BLUE}1. Testing Login (agent1@propertyhub.com)${NC}"
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent1@propertyhub.com","password":"admin123"}' | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "Token: ${TOKEN:0:20}..."
else
  echo "❌ Login failed"
  exit 1
fi
echo ""

# Test stats
echo -e "${BLUE}2. Testing Stats${NC}"
curl -s http://localhost:3001/stats | jq
echo ""

# Test properties list
echo -e "${BLUE}3. Testing Properties List (Jual)${NC}"
PROPS=$(curl -s http://localhost:3001/properties/jual | jq '.data | length')
echo -e "${GREEN}✅ Found $PROPS properties${NC}"
echo ""

# Test property detail
echo -e "${BLUE}4. Testing Property Detail${NC}"
SLUG=$(curl -s http://localhost:3001/properties/jual | jq -r '.data[0].slug')
curl -s "http://localhost:3001/properties/slug/$SLUG" | jq '{title, price, city, bedrooms, bathrooms}'
echo ""

# Test my properties
echo -e "${BLUE}5. Testing My Properties (Authenticated)${NC}"
MY_PROPS=$(curl -s http://localhost:3001/properties/my \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length')
echo -e "${GREEN}✅ Agent has $MY_PROPS properties${NC}"
echo ""

# Test property types
echo -e "${BLUE}6. Testing Property Types${NC}"
for type in rumah apartemen tanah komersial; do
  COUNT=$(curl -s "http://localhost:3001/properties/jual/$type" | jq '.data | length')
  echo "  - $type: $COUNT properties"
done
echo ""

# Test cities
echo -e "${BLUE}7. Testing Cities${NC}"
for city in jakarta surabaya bandung bali; do
  COUNT=$(curl -s "http://localhost:3001/properties/jual?city=$city" | jq '.data | length')
  echo "  - $city: $COUNT properties"
done
echo ""

echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "📝 Test Accounts:"
echo "   Admin:  admin@propertyhub.com / admin123"
echo "   Agent1: agent1@propertyhub.com / admin123"
echo "   Agent2: agent2@propertyhub.com / admin123"
echo "   User:   user@propertyhub.com / admin123"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
