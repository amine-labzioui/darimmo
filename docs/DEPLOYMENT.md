# Guide de déploiement — DarImmo

## Option 1 : Déploiement Docker (recommandé)

### Prérequis serveur
- Docker + Docker Compose
- Nom de domaine pointant vers le serveur
- Certificat SSL (Let's Encrypt via Certbot ou Nginx Proxy Manager)

### Étapes

```bash
# 1. Cloner le projet sur le serveur
git clone <votre-repo> darimmo && cd darimmo

# 2. Configurer les variables d'environnement de production
cp backend/.env.example backend/.env
nano backend/.env
```

Variables critiques à modifier pour la production :
```env
DEBUG=False
SECRET_KEY=<générer une clé forte et unique>
ALLOWED_HOSTS=votre-domaine.ma,www.votre-domaine.ma
MONGO_CONNECTION_STRING=<URI MongoDB Atlas en production>
CORS_ALLOWED_ORIGINS=https://votre-domaine.ma
STRIPE_SECRET_KEY=<clé Stripe live>
N8N_WEBHOOK_URL=<URL de production du workflow N8N>
```

```bash
# 3. Lancer la stack complète
docker compose -f docker/docker-compose.yml up -d --build

# 4. Appliquer les migrations
docker compose -f docker/docker-compose.yml exec backend python manage.py migrate

# 5. Collecter les fichiers statiques
docker compose -f docker/docker-compose.yml exec backend python manage.py collectstatic --noinput

# 6. Créer le super-utilisateur
docker compose -f docker/docker-compose.yml exec backend python manage.py createsuperuser
```

### Reverse proxy (Nginx) — exemple

```nginx
server {
    listen 80;
    server_name votre-domaine.ma;

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }

    location /media/ {
        alias /chemin/vers/darimmo/backend/media/;
    }

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
    }
}
```

Puis activez SSL avec Certbot :
```bash
sudo certbot --nginx -d votre-domaine.ma -d www.votre-domaine.ma
```

## Option 2 : Déploiement manuel (VPS)

### Backend (Gunicorn + systemd)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

Service systemd (`/etc/systemd/system/darimmo-backend.service`) :
```ini
[Unit]
Description=DarImmo Django Backend (Gunicorn)
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/darimmo/backend
ExecStart=/var/www/darimmo/backend/venv/bin/gunicorn \
    darimmo_project.wsgi:application --bind 127.0.0.1:8000 --workers 3
Restart=always
EnvironmentFile=/var/www/darimmo/backend/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable darimmo-backend
sudo systemctl start darimmo-backend
```

### Celery (systemd)

```ini
[Unit]
Description=DarImmo Celery Worker
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/darimmo/backend
ExecStart=/var/www/darimmo/backend/venv/bin/celery -A darimmo_project worker --loglevel=info
Restart=always
EnvironmentFile=/var/www/darimmo/backend/.env

[Install]
WantedBy=multi-user.target
```

### Frontend (build statique)

```bash
cd frontend
npm install
npm run build
# Servir le dossier dist/ via Nginx
```

## Checklist avant mise en production

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` unique et secrète (jamais celle de développement)
- [ ] `ALLOWED_HOSTS` configuré précisément
- [ ] HTTPS actif (certificat SSL valide)
- [ ] Sauvegardes MongoDB automatisées (`scripts/backup_db.py` via cron)
- [ ] Variables Stripe/CMI en mode **live** (pas test)
- [ ] Webhook Stripe configuré sur l'URL de production
  (`https://votre-domaine.ma/api/payments/webhooks/stripe/`)
- [ ] N8N workflow déployé en production avec authentification activée
- [ ] Logs supervisés (rotation déjà configurée dans `settings.py`)
- [ ] CORS restreint au(x) domaine(s) frontend réel(s)
- [ ] Limite de débit (`DEFAULT_THROTTLE_RATES`) ajustée selon le trafic réel

## Sauvegardes

```bash
# Sauvegarde manuelle
python scripts/backup_db.py

# Automatiser via cron (exemple : tous les jours à 2h du matin)
0 2 * * * cd /var/www/darimmo && /var/www/darimmo/backend/venv/bin/python scripts/backup_db.py
```
