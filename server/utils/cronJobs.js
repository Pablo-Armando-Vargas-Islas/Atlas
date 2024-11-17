const cron = require('node-cron');
const pool = require('../db'); 

// Tarea diaria a las 11:59 PM para cerrar cursos que hayan pasado la fecha límite
cron.schedule('59 23 * * *', async () => {
    try {
        console.log("Revisando cursos para cerrar...");
        const result = await pool.query(
            `UPDATE cursos 
             SET estado = 'cerrado' 
             WHERE fecha_fin = CURRENT_DATE AND estado = 'abierto'`
        );

        console.log(`Cursos cerrados: ${result.rowCount}`);
    } catch (err) {
        console.error("Error al cerrar cursos automáticamente:", err.message);
    }
});

// Tarea diaria a las 11:59 PM para expirar solicitudes sin descargas
cron.schedule('59 23 * * *', async () => {
    try {
        console.log("Revisando solicitudes para expirar...");

        // Cambiar el estado a 'expirado' para solicitudes aceptadas sin descargas y pasadas de la fecha límite
        const resultExpirar = await pool.query(
            `UPDATE solicitudes 
             SET status_solicitud = 'expirado' 
             WHERE status_solicitud = 'aceptada' 
             AND descargas_count = 0 
             AND fecha_limite_descarga < NOW()`
        );

        console.log(`Solicitudes expiradas: ${resultExpirar.rowCount}`);
    } catch (err) {
        console.error("Error al expirar solicitudes automáticamente:", err.message);
    }
});

// Tarea diaria a las 11:59 PM para cerrar solicitudes descargadas cuando ya hayan pasado los 10 días
cron.schedule('59 23 * * *', async () => {
    try {
        console.log("Revisando solicitudes para cerrar...");

        // Cambiar el estado a 'cerrado' para solicitudes aceptadas con al menos una descarga y pasadas de la fecha límite
        const resultCerrar = await pool.query(
            `UPDATE solicitudes 
             SET status_solicitud = 'cerrado' 
             WHERE status_solicitud = 'aceptada' 
             AND descargas_count > 0 
             AND fecha_limite_descarga < NOW()`
        );

        console.log(`Solicitudes cerradas: ${resultCerrar.rowCount}`);
    } catch (err) {
        console.error("Error al cerrar solicitudes automáticamente:", err.message);
    }
});

// Tarea mensual el 1ro de cada mes a las 2:00 AM para marcar usuarios inactivos por más de 3 años
cron.schedule('0 2 1 * *', async () => {
    try {
        console.log("Revisando usuarios inactivos...");

        // Marcar usuarios con más de 3 años de inactividad como inactivos
        const resultInactividad = await pool.query(
            `UPDATE usuarios 
             SET inactividad = TRUE 
             WHERE status_usuario = 'activo' 
             AND (ultima_actividad IS NULL OR ultima_actividad < NOW() - INTERVAL '3 years')`
        );

        console.log(`Usuarios inactivos: ${resultInactividad.rowCount}`);
    } catch (err) {
        console.error("Error al actualizar usuarios con inactividad:", err.message);
    }
});

// Tarea diaria de prueba a las 10:16 AM para marcar usuarios inactivos por más de 5 días
cron.schedule('16 10 * * *', async () => {
    try {
        console.log("Revisando usuarios con inactividad prolongada...");

        // Marcar usuarios con más de 5 días de inactividad como inactivos
        const resultInactividad = await pool.query(
            `UPDATE usuarios 
             SET inactividad = TRUE 
             WHERE status_usuario = 'activo' 
             AND (ultima_actividad IS NULL OR ultima_actividad < NOW() - INTERVAL '5 days')`
        );

        console.log(`Usuarios marcados con inactividad prolongada: ${resultInactividad.rowCount}`);
    } catch (err) {
        console.error("Error al actualizar usuarios con inactividad prolongada:", err.message);
    }
});

module.exports = cron;
