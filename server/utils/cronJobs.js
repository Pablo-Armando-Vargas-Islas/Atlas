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

module.exports = cron;
