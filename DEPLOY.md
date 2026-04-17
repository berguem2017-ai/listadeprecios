# Deploy en Railway — Paso a paso

## 1. Subir el código a GitHub

```bash
# En GitHub, crear un repo nuevo vacío "listadeprecios"
# Luego:
git remote add origin https://github.com/TU_USUARIO/listadeprecios.git
git push -u origin master
```

## 2. Instalar Railway CLI y loguear

```bash
npm install -g @railway/cli
railway login
```

## 3. Crear proyecto y servicios

```bash
cd D:/nuevoidea
railway init        # crear proyecto nuevo
railway link        # vincularlo al repo
```

## 4. Agregar plugins (desde el dashboard de Railway)

En https://railway.app → tu proyecto → "+ New":
- **PostgreSQL** → anota el `DATABASE_URL` que genera
- **Redis** → anota el `REDIS_URL` que genera

## 5. Configurar variables de entorno

```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="redis://..."
railway variables set NEXT_PUBLIC_APP_URL="https://TU-DOMINIO.railway.app"
railway variables set BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
railway variables set BETTER_AUTH_URL="https://TU-DOMINIO.railway.app"
railway variables set RESEND_API_KEY="re_xxxxxxxxxxxx"
railway variables set MP_ACCESS_TOKEN="APP_USR-xxxxxxxxxxxx"
railway variables set MP_WEBHOOK_SECRET="tu-secreto-webhook"
```

## 6. Deployar la web app

```bash
railway up
```

## 7. Ejecutar migraciones en Railway

```bash
railway run npm run db:migrate
railway run npm run db:seed
```

## 8. Deployar el worker (servicio separado)

En Railway dashboard → "+ New Service" → GitHub repo:
- **Dockerfile**: `Dockerfile.worker`
- Mismas variables de entorno que la web app

## 9. Configurar webhook de MercadoPago

En https://developers.mercadopago.com:
- Webhooks → Agregar URL: `https://TU-DOMINIO.railway.app/api/webhooks/mercadopago`
- Evento: `payment`

## 10. Dominio personalizado (opcional)

En Railway → Settings → Custom Domain → agregar `listadeprecios.ar`
Configurar DNS con el CNAME que te da Railway.

---

## Variables de entorno requeridas

| Variable | Dónde obtenerla |
|---|---|
| `DATABASE_URL` | Railway PostgreSQL plugin |
| `REDIS_URL` | Railway Redis plugin |
| `NEXT_PUBLIC_APP_URL` | Tu dominio de Railway |
| `BETTER_AUTH_SECRET` | `openssl rand -hex 32` |
| `RESEND_API_KEY` | resend.com → API Keys |
| `MP_ACCESS_TOKEN` | developers.mercadopago.com |
| `MP_WEBHOOK_SECRET` | Definilo vos, mismo valor en Railway y MP |
