# Fire Productions - VPS Deployment Guide

## Quick Start (First Time)

SSH into your VPS and run:
```bash
ssh root@192.227.228.204
curl -fsSL https://raw.githubusercontent.com/ravinduravisara/-Fire-Productions-Pvt-Ltd/main/scripts/first-deploy.sh | bash
```

Or manually:
```bash
git clone https://github.com/ravinduravisara/-Fire-Productions-Pvt-Ltd.git /opt/fire-productions
cd /opt/fire-productions
chmod +x scripts/*.sh
./scripts/first-deploy.sh
```

---

## GitHub Secrets Setup

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | `192.227.228.204` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Your SSH private key (see below) |
| `VPS_PORT` | `22` (optional) |

### Generate SSH Key (if needed)

On VPS:
```bash
ssh-keygen -t ed25519 -C "github-deploy"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519  # Copy this to VPS_SSH_KEY secret
```

---

## Environment Variables

Edit `/opt/fire-productions/.env.production` on VPS:

```env
NODE_ENV=production
PORT=5000
POSTGRES_URL=postgresql://fire:firepassword@postgres:5432/firedb?schema=public

# SMTP (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email
MAIL_TO=fireproductionspvtltd@gmail.com
MAIL_FROM_NAME=Fire Productions Website
MAIL_FROM_EMAIL=no-reply@fireproductions.lk

ADMIN_TOKEN=your-secure-token
```

---

## Manual Commands

```bash
# SSH to VPS
ssh root@192.227.228.204

# View logs
docker compose logs -f

# Restart services
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Run PostgreSQL backup manually
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile backup run --rm postgres-backup

# Run Prisma migrations
docker compose exec server npx prisma migrate deploy

# Rebuild & redeploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## Database Backup & Restore

### Backup
```bash
# Via Docker Compose (recommended)
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile backup run --rm postgres-backup

# Direct pg_dump
docker compose exec postgres pg_dump -U fire -d firedb -F c -f /tmp/backup.dump
docker cp fire-postgres:/tmp/backup.dump ./postgres-backup/
```

### Restore
```bash
# From most recent backup
docker compose exec postgres pg_restore -U fire -d firedb -c /backup/backup_YYYYMMDD_HHMMSS.dump
```

---

## SSL Setup (Optional)

Install Certbot and get SSL certificate:
```bash
apt install certbot
certbot certonly --standalone -d fireproductions.lk -d www.fireproductions.lk
```

Then update `nginx.conf` to use SSL certificates.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | `docker compose logs [service]` |
| PostgreSQL connection error | Check `POSTGRES_URL` in `.env.production` |
| Prisma migration fails | `docker compose exec server npx prisma migrate deploy` |
| GitHub Actions fails | Verify SSH key in secrets |
| Port 80 in use | `systemctl stop apache2` or `nginx` |
