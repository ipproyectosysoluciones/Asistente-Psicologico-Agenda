# Guía de Contribución

Gracias por tu interés en contribuir al Asistente Psicológico Agenda. Este documento explica cómo hacerlo correctamente.

## Flujo de trabajo de ramas

```
main (producción)
  └── release (staging)
        └── dev (desarrollo activo)
              └── feature/*, fix/*, chore/* (tu rama de trabajo)
```

Siempre creá tu rama desde `dev`. **Nunca hagas commits directos a `main`, `release` o `dev`.**

## Pasos para contribuir

1. Hacé fork del repositorio
2. Creá tu rama desde `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/descripcion-corta
   ```
3. Hacé tus cambios siguiendo las convenciones de código
4. Asegurate de que el linter pase: `pnpm lint`
5. Creá un Pull Request hacia `dev` con descripción clara

## Convenciones de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
chore: tareas de mantenimiento
docs: cambios en documentación
refactor: refactorización sin cambio de comportamiento
test: agregar o modificar tests
ci: cambios en pipelines de CI/CD
```

## Estructura del proyecto

```
bot/          → Bot de WhatsApp (Node.js + builderbot + Baileys)
dashboard/    → Panel de administración (React/Vite)
infrastructure/
  ├── n8n/    → Workflows de n8n (JSON)
  ├── migrations/ → Migraciones SQL
  └── docker-compose.yml
```

## Requisitos del entorno

- Node.js 20 LTS
- pnpm 10+
- Docker y Docker Compose
- PostgreSQL 15 (vía Docker)

## Levantar el entorno local

```bash
# Stack completo (DB + n8n + dashboard)
cd infrastructure && docker compose up -d

# Bot
cd bot && pnpm install && pnpm dev
```

## Preguntas

Abrí un [Issue](../../issues) con la etiqueta `question`.
