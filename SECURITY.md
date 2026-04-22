# Security Policy / Política de Seguridad

## 🇬🇧 English

### Supported Versions / Versiones Soportadas

| Version | Supported | Notes |
|---------|-----------|-------|
| 1.0.x | ✅ | Current stable |

### Reporting a Vulnerability

If you discover a security vulnerability, please report it by email to [security email] or through GitHub Security Advisories.

**Please do NOT report security vulnerabilities through public GitHub issues.**

### Known Security Issues

We monitor dependencies for security updates. The following issues have been identified but cannot be immediately fixed due to third-party dependencies:

#### Critical

- **protobufjs** (< 6.11.4)
  - Arbitrary code execution vulnerability
  - Source: `baileys` (used by BuilderBot)
  - Status: Pending fix upstream
  - Workaround: Do not process untrusted protobuf messages

#### Moderate

- **got** (< 11.8.3)
  - Redirect to UNIX socket
  - Source: `wppconnect` (used by BuilderBot)
  - Status: Pending fix upstream

- **file-type** (< 16.5.4)
  - Infinite loop on malformed input
  - Source: `wppconnect` (used by BuilderBot)
  - Status: Pending fix upstream

### Dependencies

Security is monitored through GitHub Dependabot. We use `pnpm overrides` in `package.json` to enforce minimum secure versions where possible:

```json
"pnpm": {
  "overrides": {
    "protobufjs": ">=6.11.4",
    "got": ">=11.8.3",
    "file-type": ">=16.5.4"
  }
}
```

### Security Best Practices for Deployment

1. **Change default credentials** before production
2. **Use environment variables** for sensitive data
3. **Restrict network access** to the bot
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated** when fixes are available

---

## 🇪🇸 Español

### Versiones Soportadas

| Versión | Soportada | Notas |
|--------|-----------|-------|
| 1.0.x | ✅ | Estable actual |

### Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad, repórtala por email o a través de GitHub Security Advisories.

**Por favor NO reportes vulnerabilidades a través de issues públicos.**

### Problemas de Seguridad Conocidos

Monitoreamos las dependencias para actualizaciones de seguridad. Los siguientes problemas han sido identificados pero no pueden ser reparados inmediatamente debido a dependencias de terceros:

#### Crítico

- **protobufjs** (< 6.11.4)
  - Vulnerabilidad de ejecución de código arbitrario
  - Origen: `baileys` (usado por BuilderBot)
  - Estado: Pendiente de fix upstream
  - Workaround: No procesar mensajes protobuf no confiables

#### Moderado

- **got** (< 11.8.3)
  - Redirección a socket UNIX
  - Origen: `wppconnect` (usado por BuilderBot)
  - Estado: Pendiente de fix upstream

- **file-type** (< 16.5.4)
  - Bucle infinito en input malformado
  - Origen: `wppconnect` (usado por BuilderBot)
  - Estado: Pendiente de fix upstream

### Dependencias

La seguridad se monitorea a través de GitHub Dependabot. Usamos `pnpm overrides` en `package.json` para forzar versiones mínimas seguras donde es posible:

```json
"pnpm": {
  "overrides": {
    "protobufjs": ">=6.11.4",
    "got": ">=11.8.3",
    "file-type": ">=16.5.4"
  }
}
```

### Mejores Prácticas de Seguridad para Producción

1. **Cambiar credenciales por defecto** antes de producción
2. **Usar variables de entorno** para datos sensibles
3. **Restringir acceso de red** al bot
4. **Monitorear logs** para actividad sospechosa
5. **Mantener dependencias actualizadas** cuando haya fixes disponibles

---

## 📋 Security Audit Checklist

- [ ] Change default dashboard password / Cambiar contraseña por defecto del dashboard
- [ ] Set secure DATABASE_URL / Configurar DATABASE_URL segura
- [ ] Configure firewall rules / Configurar reglas de firewall
- [ ] Enable HTTPS in production / Habilitar HTTPS en producción
- [ ] Review access logs / Revisar logs de acceso
- [ ] Set up monitoring / Configurar monitoreo
- [ ] Backup strategy / Estrategia de backup

---

## 🔒 Contact / Contacto

For security issues / Para problemas de seguridad:
- Email: [to be added]
- GitHub Security Advisory