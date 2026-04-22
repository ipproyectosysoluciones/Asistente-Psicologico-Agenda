# GitHub Secrets Setup Guide / Guía de Configuración de Secrets

## 🇬🇧 English

### Required Secrets / Secretos Requeridos

Go to: **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value | Required |
|-------------|-------|----------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | ✅ |
| `DOCKERHUB_TOKEN` | Docker Hub access token | ✅ |

### How to Create Docker Hub Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: `GitHub Actions`
4. Select scopes: `Read, Write, Delete`
5. Copy the token (shown only once!)

### How it Works / Cómo Funciona

When you push to `main` or `release` branch, or create a tag:
1. GitHub Actions triggers automatically
2. Builds both bot and dashboard images
3. Pushes to your Docker Hub
4. Images available for Railway deployment

### Testing the Workflow

```bash
# Trigger manually
gh workflow run docker-push.yml
# or
git push origin main
```

---

## 🇪🇸 Español

### Secretos Requeridos

Ve a: **Settings → Secrets and variables → Actions**

Agrega estos secrets:

| Nombre del Secret | Valor | Requerido |
|-------------------|-------|----------|
| `DOCKERHUB_USERNAME` | Tu usuario de Docker Hub | ✅ |
| `DOCKERHUB_TOKEN` | Token de acceso Docker Hub | ✅ |

### Cómo Crear un Token de Docker Hub

1. Ve a https://hub.docker.com/settings/security
2. Click en "New Access Token"
3. Nombre: `GitHub Actions`
4. Selecciona permisos: `Read, Write, Delete`
5. Copia el token (¡solo se muestra una vez!)

### Cómo Funciona

Cuando haces push a `main` o `release`, o creas un tag:
1. GitHub Actions se dispara automáticamente
2. Build de bot y dashboard
3. Push a tu Docker Hub
4. Imágenes disponibles para Railway

### Probar el Workflow

```bash
# Disparar manualmente
gh workflow run docker-push.yml
# o
git push origin main
```

---

## ⚠️ Important / Importante

**NEVER store these in GitHub:**
- ❌ Passwords / Contraseñas reales
- ❌ API Keys privadas
- ❌ Database credentials / Credenciales de DB
- ❌ Private keys / Claves privadas

**✅ Safe to store:**
- ✅ Usernames públicos
- ✅ Access tokens (not secret keys)
- ✅ Image names / Nombres de imágenes