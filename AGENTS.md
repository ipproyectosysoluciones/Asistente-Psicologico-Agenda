# Agentes de Asistente Psicológico

## Stack Principal
- **Backend**: Node.js, PostgreSQL, n8n
- **Bot**: BuilderBot + WPPConnect
- **Frontend**: Pendiente (Dashboard)

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
```

## Notas Importantes
- Puerto n8n: 5678
- Puerto bot: 3000
- PostgreSQL: 5432
- El bot de WhatsApp tiene problemas de conexión desde redes restringidas