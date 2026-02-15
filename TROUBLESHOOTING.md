# Troubleshooting Test Runner

## Network Error: "Failed to load test files"

If you're seeing a network error when trying to load test files, follow these steps:

### 1. Check if Server is Running

Make sure your server is running:
```bash
npm start
```

You should see:
```
✅ MongoDB connected
✅ Postgres connected
✅ Redis connected
Server is running on port 3000
```

### 2. Verify Server is Accessible

Open your browser and check:
- Main server: `http://localhost:3000`
- Test runner UI: `http://localhost:3000/test-runner.html`
- API health check: `http://localhost:3000/api/v1/test-runner/health`

The health check should return:
```json
{
  "success": true,
  "message": "Test runner API is running"
}
```

### 3. Check Browser Console

Open browser developer tools (F12) and check:
- Console tab for any JavaScript errors
- Network tab to see if requests are being made
- Check if requests are failing with CORS errors

### 4. Verify Routes are Registered

Check that the test runner routes are properly registered:
- `GET /api/v1/test-runner/health` - Health check
- `GET /api/v1/test-runner/files` - Get test files
- `POST /api/v1/test-runner/run` - Run tests

### 5. Check Test Files Exist

Verify test files are in the correct location:
```bash
ls -la src/__tests__/*.test.js
```

You should see:
- `auth.test.js`
- `whiskey.test.js`

### 6. Check Database Connections

The test runner needs databases to be running:
```bash
docker-compose up -d
```

### 7. Common Issues

#### Issue: CORS Error
**Solution**: CORS is already enabled in the server. If you still see CORS errors, check that `cors` middleware is properly configured.

#### Issue: 404 Not Found
**Solution**: 
- Verify the server is running
- Check that routes are registered in `src/api/router/index.router.js`
- Ensure static files are being served from `public/` directory

#### Issue: Port Already in Use
**Solution**: 
- Change PORT in `.env` file
- Or kill the process using the port:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

#### Issue: Database Connection Failed
**Solution**:
- Start databases: `docker-compose up -d`
- Check `.env` file has correct database URLs
- Verify databases are accessible

### 8. Manual API Test

Test the API directly using curl:
```bash
# Health check
curl http://localhost:3000/api/v1/test-runner/health

# Get test files
curl http://localhost:3000/api/v1/test-runner/files
```

### 9. Check Server Logs

Look at the server console output for any errors when:
- Loading the test runner page
- Making API requests
- Running tests

### 10. Reset Everything

If nothing works, try:
```bash
# Stop server (Ctrl+C)
# Restart databases
docker-compose down
docker-compose up -d

# Restart server
npm start
```

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Check server logs for backend errors
3. Verify all dependencies are installed: `npm install`
4. Make sure Node.js version is compatible (v14+)

