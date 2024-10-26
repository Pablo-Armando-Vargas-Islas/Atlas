const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');


// Ruta para obtener el número total de usuarios por rol
router.get('/usuarios/total', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT roles.nombre_rol AS rol, COUNT(*) AS cantidad
             FROM usuarios
             JOIN roles ON usuarios.rol_id = roles.id
             GROUP BY roles.nombre_rol`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener el número total de usuarios' });
    }
});




// Ruta para obtener el número de cursos activos y cerrados
router.get('/cursos/estado', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                CASE WHEN fecha_fin IS NULL THEN 'abierto' ELSE 'cerrado' END AS estado, 
                COUNT(*) AS cantidad
             FROM cursos
             GROUP BY CASE WHEN fecha_fin IS NULL THEN 'abierto' ELSE 'cerrado' END`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener el número de cursos activos y cerrados' });
    }
});






// Ruta para obtener el número total de proyectos entregados
router.get('/proyectos/total', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT tipo AS tipo_proyecto, COUNT(*) AS cantidad
             FROM proyectos
             GROUP BY tipo`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener el número total de proyectos' });
    }
});




// Ruta para obtener el número de solicitudes pendientes
router.get('/solicitudes/pendientes', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) as cantidad
             FROM solicitudes
             WHERE status_solicitud = 'pendiente'`
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener el número de solicitudes pendientes' });
    }
});




module.exports = router;