# 🧪 Login and Navigation Test Suite

## Automated Test Script

```bash
#!/bin/bash

# Dental Management Dashboard - Login and Navigation Test
# This script tests login functionality and page access

echo "🧪 Starting Login and Navigation Tests..."

# Test credentials
declare -A users=(
    ["admin"]="admin123"
    ["receptionist"]="reception123" 
    ["dentist1"]="dentist123"
)

# Test URLs
declare -a pages=(
    "/"
    "/appointments"
    "/patients"
    "/dentists"
    "/availability"
    "/calendar"
    "/users"
    "/settings"
)

# Function to test login
test_login() {
    local username=$1
    local password=$2
    
    echo "🔐 Testing login for: $username"
    
    # Test login API endpoint
    response=$(curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    if echo "$response" | grep -q "token"; then
        echo "✅ Login successful for $username"
        return 0
    else
        echo "❌ Login failed for $username"
        echo "Response: $response"
        return 1
    fi
}

# Function to test page access
test_page_access() {
    local page=$1
    local token=$2
    
    echo "📄 Testing access to: $page"
    
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $token" \
        "http://localhost:3000$page")
    
    if [ "$response" = "200" ]; then
        echo "✅ Access granted to $page"
        return 0
    else
        echo "❌ Access denied to $page (HTTP $response)"
        return 1
    fi
}

# Main test execution
echo "🚀 Starting tests..."

# Test each user
for username in "${!users[@]}"; do
    password="${users[$username]}"
    
    echo ""
    echo "👤 Testing user: $username"
    echo "================================"
    
    # Test login
    if test_login "$username" "$password"; then
        # Get token for further tests
        token=$(curl -s -X POST http://localhost:3000/api/auth/login \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$username\",\"password\":\"$password\"}" | \
            grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$token" ]; then
            echo "🎫 Token obtained: ${token:0:20}..."
            
            # Test page access
            for page in "${pages[@]}"; do
                test_page_access "$page" "$token"
            done
        else
            echo "❌ Failed to extract token"
        fi
    fi
done

echo ""
echo "🏁 Tests completed!"
echo "Check the output above for any failures."
