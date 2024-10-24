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

        console.log(`Solicitudes expiradas automáticamente: ${resultExpirar.rowCount}`);
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

        console.log(`Solicitudes cerradas automáticamente: ${resultCerrar.rowCount}`);
    } catch (err) {
        console.error("Error al cerrar solicitudes automáticamente:", err.message);
    }
});

module.exports = cron;
