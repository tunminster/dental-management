// Browser-based Login and Navigation Test
// Run this in browser console or use Playwright

const testLoginAndNavigation = async () => {
    console.log('🧪 Starting Browser Login and Navigation Test...');
    
    // Test users
    const testUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'receptionist', password: 'reception123', role: 'receptionist' },
        { username: 'dentist1', password: 'dentist123', role: 'dentist' }
    ];
    
    // Pages to test
    const pages = [
        { path: '/', name: 'Dashboard', permission: null },
        { path: '/appointments', name: 'Appointments', permission: 'appointments' },
        { path: '/patients', name: 'Patients', permission: 'patients' },
        { path: '/dentists', name: 'Dentists', permission: 'dentists' },
        { path: '/availability', name: 'Availability', permission: 'availability' },
        { path: '/calendar', name: 'Calendar', permission: 'calendar' },
        { path: '/users', name: 'Users', permission: 'all' },
        { path: '/settings', name: 'Settings', permission: null }
    ];
    
    const results = [];
    
    for (const user of testUsers) {
        console.log(`\n👤 Testing user: ${user.username} (${user.role})`);
        console.log('='.repeat(50));
        
        const userResults = {
            username: user.username,
            role: user.role,
            loginSuccess: false,
            pageAccess: {}
        };
        
        try {
            // Step 1: Navigate to login page
            window.location.href = '/login';
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 2: Fill login form
            const usernameInput = document.querySelector('input[name="username"], input[type="text"]');
            const passwordInput = document.querySelector('input[name="password"], input[type="password"]');
            const loginButton = document.querySelector('button[type="submit"], .btn-primary');
            
            if (usernameInput && passwordInput && loginButton) {
                usernameInput.value = user.username;
                passwordInput.value = user.password;
                loginButton.click();
                
                // Wait for login to complete
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check if login was successful
                if (window.location.pathname !== '/login') {
                    userResults.loginSuccess = true;
                    console.log('✅ Login successful');
                    
                    // Step 3: Test each page
                    for (const page of pages) {
                        console.log(`📄 Testing ${page.name} (${page.path})`);
                        
                        try {
                            // Navigate to page
                            window.location.href = page.path;
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            
                            // Check if we can access the page
                            const currentPath = window.location.pathname;
                            const isAccessible = currentPath === page.path;
                            
                            userResults.pageAccess[page.path] = {
                                accessible: isAccessible,
                                expectedPermission: page.permission,
                                actualPath: currentPath
                            };
                            
                            if (isAccessible) {
                                console.log(`✅ Access granted to ${page.name}`);
                            } else {
                                console.log(`❌ Access denied to ${page.name} (redirected to ${currentPath})`);
                            }
                            
                        } catch (error) {
                            console.log(`❌ Error testing ${page.name}:`, error.message);
                            userResults.pageAccess[page.path] = {
                                accessible: false,
                                error: error.message
                            };
                        }
                    }
                } else {
                    console.log('❌ Login failed - still on login page');
                }
            } else {
                console.log('❌ Could not find login form elements');
            }
            
        } catch (error) {
            console.log('❌ Error during login test:', error.message);
        }
        
        results.push(userResults);
        
        // Logout for next user
        try {
            const logoutButton = document.querySelector('[data-testid="logout"], .logout-btn');
            if (logoutButton) {
                logoutButton.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            // Clear localStorage manually
            localStorage.removeItem('authToken');
            localStorage.removeItem('dental_user');
        }
    }
    
    // Generate test report
    console.log('\n📊 TEST REPORT');
    console.log('='.repeat(50));
    
    results.forEach(result => {
        console.log(`\n👤 User: ${result.username} (${result.role})`);
        console.log(`🔐 Login: ${result.loginSuccess ? '✅ Success' : '❌ Failed'}`);
        
        if (result.loginSuccess) {
            Object.entries(result.pageAccess).forEach(([path, access]) => {
                const status = access.accessible ? '✅' : '❌';
                console.log(`📄 ${path}: ${status} ${access.accessible ? 'Accessible' : 'Denied'}`);
                if (!access.accessible && access.error) {
                    console.log(`   Error: ${access.error}`);
                }
            });
        }
    });
    
    return results;
};

// Run the test
testLoginAndNavigation().then(results => {
    console.log('\n🏁 Test completed!');
    console.log('Results:', results);
}).catch(error => {
    console.error('❌ Test failed:', error);
});
