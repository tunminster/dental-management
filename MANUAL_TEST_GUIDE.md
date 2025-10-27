# 🧪 Manual Login and Navigation Test Guide

## Test Setup

1. **Start the application:**
   ```bash
   # Using Docker
   docker run -d --name dental-test -p 3000:80 dental-dashboard-debug
   
   # Or using npm
   npm run dev
   ```

2. **Open browser:** `http://localhost:3000` (or `http://localhost:5173` for dev)

## Test Users

| Username | Password | Role | Expected Permissions |
|----------|----------|------|---------------------|
| `admin` | `admin123` | admin | All pages |
| `receptionist` | `reception123` | receptionist | appointments, patients, calendar |
| `dentist1` | `dentist123` | dentist | appointments, patients, dentists, availability, calendar |

## Test Steps

### 🔐 Login Test

1. **Navigate to login page**
   - URL: `http://localhost:3000/login`
   - Should see login form

2. **Test each user login:**
   - Enter username and password
   - Click "Login" button
   - Should redirect to dashboard (`/`)
   - Check browser console for debug logs

### 📄 Page Access Test

For each logged-in user, test access to these pages:

#### ✅ Admin User Tests
- **Dashboard** (`/`) - Should work
- **Appointments** (`/appointments`) - Should work
- **Patients** (`/patients`) - Should work
- **Dentists** (`/dentists`) - Should work
- **Availability** (`/availability`) - Should work
- **Calendar** (`/calendar`) - Should work
- **Users** (`/users`) - Should work (admin only)
- **Settings** (`/settings`) - Should work

#### ✅ Receptionist User Tests
- **Dashboard** (`/`) - Should work
- **Appointments** (`/appointments`) - Should work
- **Patients** (`/patients`) - Should work
- **Calendar** (`/calendar`) - Should work
- **Dentists** (`/dentists`) - Should show "Access Denied"
- **Availability** (`/availability`) - Should show "Access Denied"
- **Users** (`/users`) - Should show "Access Denied"
- **Settings** (`/settings`) - Should work

#### ✅ Dentist User Tests
- **Dashboard** (`/`) - Should work
- **Appointments** (`/appointments`) - Should work
- **Patients** (`/patients`) - Should work
- **Dentists** (`/dentists`) - Should work
- **Availability** (`/availability`) - Should work
- **Calendar** (`/calendar`) - Should work
- **Users** (`/users`) - Should show "Access Denied"
- **Settings** (`/settings`) - Should work

## 🔍 What to Check

### Browser Console Logs
Open Developer Tools (F12) and check for:
```
ProtectedRoute Debug: {
  user: { id: 1, username: "admin", role: "admin" },
  loading: false,
  permission: "appointments",
  hasPermission: true,
  currentPath: "/appointments"
}
```

### Expected Behaviors

1. **Successful Login:**
   - Redirect to dashboard
   - User info in console logs
   - Navigation menu visible

2. **Page Access Granted:**
   - Page loads correctly
   - Console shows "Access granted, rendering children"
   - No redirect to login

3. **Page Access Denied:**
   - Shows "Access Denied" page
   - Console shows "Permission denied for: [permission]"
   - Shows required permission and user role

4. **Authentication Issues:**
   - Redirected to login page
   - Console shows "No user found, redirecting to login"

## 🚨 Common Issues

### Issue 1: Stuck on Login Page
- **Check:** Console for API errors
- **Check:** Network tab for failed requests
- **Solution:** Verify API_BASE_URL is correct

### Issue 2: All Pages Show "Access Denied"
- **Check:** User role in console logs
- **Check:** Permission mapping in AuthContext
- **Solution:** Verify hasPermission function

### Issue 3: 404 Page Appears
- **Check:** Current URL in 404 page
- **Check:** nginx configuration
- **Solution:** Verify client-side routing setup

### Issue 4: Infinite Loading
- **Check:** Console for "Loading..." stuck
- **Check:** API calls timing out
- **Solution:** Check network connectivity

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

User: admin
Login: ✅/❌
Dashboard: ✅/❌
Appointments: ✅/❌
Patients: ✅/❌
Dentists: ✅/❌
Availability: ✅/❌
Calendar: ✅/❌
Users: ✅/❌
Settings: ✅/❌

User: receptionist
Login: ✅/❌
Dashboard: ✅/❌
Appointments: ✅/❌
Patients: ✅/❌
Dentists: ✅/❌ (should be denied)
Availability: ✅/❌ (should be denied)
Calendar: ✅/❌
Users: ✅/❌ (should be denied)
Settings: ✅/❌

User: dentist1
Login: ✅/❌
Dashboard: ✅/❌
Appointments: ✅/❌
Patients: ✅/❌
Dentists: ✅/❌
Availability: ✅/❌
Calendar: ✅/❌
Users: ✅/❌ (should be denied)
Settings: ✅/❌
```

## 🎯 Success Criteria

- ✅ All users can log in successfully
- ✅ Users can access pages they have permission for
- ✅ Users are denied access to pages they don't have permission for
- ✅ Proper error messages are shown
- ✅ No JavaScript errors in console
- ✅ Navigation works correctly
- ✅ Logout functionality works
