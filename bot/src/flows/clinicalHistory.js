import { addAnswer, addKeyword } from '@builderbot/bot'

export const clinicalHistoryFlow = [
    addKeyword(['📋 Mi Historia Clínica', 'historia', 'hc', 'mi historial'])
        .addAnswer('*📋 Historia Clínica*\n\nTu información clínica está protegida según las normativas:\n\n🇨🇴 Ley 1581 (Colombia) · 🇲🇽 LFPDPPP · 🇪🇸 RGPD · 🇺🇸 HIPAA\n\n✅ Solo tu psicólogo tratante puede ver estos datos.\n\n*¿Qué deseas hacer?*\n\n  1. Completar mi historia — escribí *completar historia*\n  2. Ver mi información — escribí *ver informacion*\n  3. Volver al menú — escribí *menu*'),

    addKeyword(['completar historia', '📝 Completar Historia'])
        .addAnswer('*📝 Completar Historia Clínica*\n\nPara crear tu historia clínica necesitás completar un formulario.\n\nUn enlace será enviado a tu email registrado.\n\n*¿Confirmás?* Respondé *sí* para continuar o *menu* para salir.'),

    addKeyword(['ver informacion', 'ver información', '📄 Ver mi información'])
        .addAnswer('*📄 Tu Información*\n\nTu información está en nuestra base de datos segura.\n\nPara acceder, tu psicólogo debe habilitarte el acceso.\n\n⚠️ *Por seguridad, no mostramos datos sensibles aquí.*\n\nEscribí *menu* para volver al inicio.')
]

