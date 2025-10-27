#!/bin/bash

# Simple API Test for Login and Navigation
# This tests the API endpoints directly

echo "🧪 Testing API Endpoints..."

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api"

# Test users
declare -A users=(
    ["admin"]="admin123"
    ["receptionist"]="reception123"
    ["dentist1"]="dentist123"
)

echo "🔍 Testing API connectivity..."
if curl -s "$API_URL/health" > /dev/null; then
    echo "✅ API is reachable"
else
    echo "❌ API is not reachable at $API_URL"
    echo "Make sure the application is running on port 3000"
    exit 1
fi

echo ""
echo "🔐 Testing login endpoints..."

for username in "${!users[@]}"; do
    password="${users[$username]}"
    
    echo "Testing login for: $username"
    
    # Test login
    response=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    if echo "$response" | grep -q "token"; then
        echo "✅ Login successful for $username"
        
        # Extract token
        token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$token" ]; then
            echo "🎫 Token obtained: ${token:0:20}..."
            
            # Test protected endpoints
            echo "📄 Testing protected endpoints..."
            
            endpoints=(
                "dashboard"
                "appointments"
                "patients"
                "dentists"
                "availability"
                "calendar"
                "users"
                "settings"
            )
            
            for endpoint in "${endpoints[@]}"; do
                status=$(curl -s -w "%{http_code}" -o /dev/null \
                    -H "Authorization: Bearer $token" \
                    "$API_URL/$endpoint")
                
                if [ "$status" = "200" ]; then
                    echo "✅ $endpoint: Accessible"
                elif [ "$status" = "403" ]; then
                    echo "🚫 $endpoint: Permission denied (expected for some users)"
                else
                    echo "❌ $endpoint: HTTP $status"
                fi
            done
        else
            echo "❌ Failed to extract token from response"
        fi
    else
        echo "❌ Login failed for $username"
        echo "Response: $response"
    fi
    
    echo ""
done

echo "🏁 API tests completed!"
