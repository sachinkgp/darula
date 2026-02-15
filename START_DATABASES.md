# Starting Databases

## Quick Start

### Option 1: Using Docker Compose (Recommended)

If you have Docker installed and your user has permissions:

```bash
# Start all databases
docker-compose up -d

# Check status
docker-compose ps

# Stop databases
docker-compose down
```

### Option 2: Using sudo

If you get permission errors:

```bash
# Start databases with sudo
sudo docker-compose up -d

# Check status
sudo docker-compose ps
```

### Option 3: Fix Docker Permissions (One-time setup)

Add your user to the docker group (requires logout/login):

```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

After logging back in:
```bash
docker-compose up -d
```

## Verify Databases are Running

```bash
# Check MongoDB
docker ps | grep mongo

# Check PostgreSQL
docker ps | grep postgres

# Check Redis
docker ps | grep redis
```

Or check all at once:
```bash
docker-compose ps
```

## Manual Database Setup (Alternative)

If you prefer to run databases manually:

### MongoDB
```bash
# Install MongoDB locally or use Docker
mongod --dbpath /path/to/data
```

### PostgreSQL
```bash
# Install PostgreSQL locally
# Update POSTGRES_URL in .env to point to your local instance
```

### Redis
```bash
# Install Redis locally
redis-server
```

## Test Runner Works Without Databases

**Good news!** The test runner UI will work even if databases aren't running. However, the actual API tests will fail if databases aren't available.

To run tests successfully, you need:
1. MongoDB running (for whiskey API tests)
2. PostgreSQL running (for auth API tests)
3. Redis running (optional, but recommended)

## Troubleshooting

### "Permission denied" error
- Use `sudo docker-compose up -d`
- Or fix permissions: `sudo usermod -aG docker $USER` (then logout/login)

### "Port already in use"
- Check if databases are already running: `docker-compose ps`
- Or change ports in `docker-compose.yml`

### "Cannot connect to Docker daemon"
- Make sure Docker is running: `sudo systemctl start docker`
- Or use `sudo` with docker commands

