# ATAPOLY CBT - Local Exam Server

## Prerequisites
- **Node.js** 18+ installed on the host machine
- **PostgreSQL** 15+ installed and running

## Quick Setup

### 1. Install PostgreSQL & Create User
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql

# Or on Windows, download from https://www.postgresql.org/download/

# Create the database user
sudo -u postgres psql -c "CREATE USER cbt_admin WITH PASSWORD 'cbt_password' CREATEDB;"
```

### 2. Initialize Database
```bash
cd server
npm install
npm run db:init    # Creates database + schema
npm run db:seed    # Inserts sample data
```

### 3. Start the Server
```bash
npm start
# Server runs on http://0.0.0.0:3001
```

### 4. Configure Client Computers
On each exam client computer, open a browser and navigate to:
```
http://<HOST_IP>:3001
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `atapoly_cbt` | Database name |
| `DB_USER` | `cbt_admin` | Database user |
| `DB_PASSWORD` | `cbt_password` | Database password |
| `JWT_SECRET` | (default key) | **Change in production!** |
| `ONLINE_SERVER_URL` | (empty) | Online server URL for sync |
| `SYNC_INTERVAL` | `60000` | Sync check interval (ms) |

## Architecture

```
┌─────────────────────────────────────────────────┐
│  HOST MACHINE (Exam Server)                     │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Express  │──│ PostgreSQL │  │ Sync       │  │
│  │ :3001    │  │ :5432      │  │ Service    │  │
│  └──────────┘  └────────────┘  └─────┬──────┘  │
│       │                              │          │
└───────┼──────────────────────────────┼──────────┘
        │ LAN (offline)                │ Internet (when available)
   ┌────┴────┐                    ┌────┴────┐
   │ Client  │ x1000             │ Online  │
   │ Browsers│                    │ Server  │
   └─────────┘                    └─────────┘
```

## Default Login Credentials
- **Admin**: admin@cbt.edu.ng / admin123
- **Instructor**: adeyemi@cbt.edu.ng / instructor123
- **Students**: ATAP/ND/COM/23/001 + exam PIN
