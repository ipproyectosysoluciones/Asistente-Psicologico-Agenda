# Política de Seguridad

## Versiones soportadas

| Versión | Soporte de seguridad |
|---------|----------------------|
| main    | ✅ Activo             |
| release | ✅ Activo             |
| dev     | ⚠️ Solo desarrollo   |

## Reportar una vulnerabilidad

**No abras un Issue público para reportar vulnerabilidades de seguridad.**

Enviá un correo a **info@ipproyectosysoluciones.com.co** con:

- Descripción detallada de la vulnerabilidad
- Pasos para reproducirla
- Impacto potencial
- Sugerencia de solución (opcional)

Recibirás respuesta en un plazo máximo de **72 horas**. Si la vulnerabilidad es confirmada, publicaremos un fix y te daremos crédito en el changelog.

## Buenas prácticas de seguridad

- Nunca comités archivos `.env` ni credenciales al repositorio
- Las credenciales de producción se gestionan exclusivamente vía Railway Secrets
- Las credenciales de n8n (Google, PostgreSQL) se configuran desde la UI de n8n, no en código
- El bot de WhatsApp usa archivos de sesión locales — nunca los subas al repo
