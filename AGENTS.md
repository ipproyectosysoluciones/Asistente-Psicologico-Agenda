# Agentes de Asistente Psicológico

## Stack Principal

- **Backend**: Node.js, PostgreSQL, n8n
- **Bot**: BuilderBot + WPPConnect
- **Frontend**: React + Vite + Tailwind CSS 4 + shadcn/ui

## Ramas

- `main` - Versión estable del MVP
- `release` - Versionado y pre-lanzamiento
- `dev` - Desarrollo activo

## Workflow

1. Crear rama feature desde `dev`
2. Desarrollar y testear
3. Mergear a `dev`
4. Cuando esté listo → mergear a `release`
5. Versionar (tag) → mergear a `main`

## Comandos

```bash
# Nuevo feature
git checkout dev
git pull
git checkout -b feature/nombre-del-feature

# Mergear a dev
git checkout dev
git merge feature/nombre-del-feature

# Preparar release
git checkout release
git merge dev
git tag v1.0.0
git push origin release --tags

# Merge a main
git checkout main
git merge release
git push origin main
```

## Puertos

- n8n: 5678
- bot: 3000
- dashboard: 5173
- PostgreSQL: 5432

## Stack de Comandos

```bash
# Instalar todo
cd bot && pnpm install
cd dashboard && pnpm install

# Desarrollo
cd bot && pnpm dev      # Puerto 3000
cd dashboard && pnpm dev # Puerto 5173

# Build
cd dashboard && pnpm build  # Production build
```

## Notas Importantes

- El bot de WhatsApp tiene problemas de conexión desde redes restringidas (necesita VPS)
- Credenciales dashboard: admin / password (cambiar en producción)

## Documentación

- README.md - Documentación principal (ES/EN)
- CHANGELOG.md - Historial de cambios
- infrastructure/README.md - Documentación de n8n
- infrastructure/GOOGLE-SETUP.md - Google Calendar API
