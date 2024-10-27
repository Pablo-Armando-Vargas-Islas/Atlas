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
                estado, 
                COUNT(*) AS cantidad
             FROM cursos
             GROUP BY estado`
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

// Nueva ruta para obtener las solicitudes por estado
router.get('/solicitudes/estado', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT status_solicitud, COUNT(*) AS cantidad
             FROM solicitudes
             GROUP BY status_solicitud`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener el número de solicitudes por estado' });
    }
});

// Nueva ruta para obtener la actividad reciente de proyectos y cursos
router.get('/actividad/reciente', verifyToken, async (req, res) => {
    try {
        const resultProyectos = await pool.query(
            `SELECT date_trunc('week', fecha_hora) AS semana, COUNT(*) AS cantidad
             FROM proyectos
             GROUP BY semana
             ORDER BY semana DESC
             LIMIT 8`
        );

        const resultCursos = await pool.query(
            `SELECT date_trunc('week', fecha_inicio) AS semana, COUNT(*) AS cantidad
             FROM cursos
             GROUP BY semana
             ORDER BY semana DESC
             LIMIT 8`
        );

        res.json({
            proyectos: resultProyectos.rows,
            cursos: resultCursos.rows,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener la actividad reciente' });
    }
});

// Nueva ruta para obtener la cantidad de estudiantes activos
router.get('/estudiantes/activos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) AS cantidad 
             FROM usuarios 
             WHERE rol_id = 3 AND ultima_actividad >= NOW() - INTERVAL '7 days'`
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener estudiantes activos:', err.message);
        res.status(500).json({ error: 'Error al obtener estudiantes activos' });
    }
});

// Nueva ruta para obtener la cantidad de profesores activos
router.get('/profesores/activos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) AS cantidad 
             FROM usuarios 
             WHERE rol_id = 2 AND ultima_actividad >= NOW() - INTERVAL '7 days'`
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener profesores activos:', err.message);
        res.status(500).json({ error: 'Error al obtener profesores activos' });
    }
});

// Nueva ruta para obtener los proyectos más solicitados
router.get('/proyectos/mas-solicitados', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, titulo, popularidad
             FROM proyectos
             ORDER BY popularidad DESC
             LIMIT 5`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener proyectos más solicitados:', err.message);
        res.status(500).json({ error: 'Error al obtener proyectos más solicitados' });
    }
});

// Nueva ruta para obtener el resumen de cursos por profesor
router.get('/cursos/por-profesor', verifyToken, async (req, res) => {
    try {
        const { searchQuery = '', page = 1, limit = 5 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT profesores.nombre, COUNT(cursos.id) AS cantidad_cursos
             FROM usuarios AS profesores
             LEFT JOIN cursos ON profesores.id = cursos.profesor_id
             WHERE profesores.rol_id = 2 AND profesores.nombre ILIKE $3
             GROUP BY profesores.id
             ORDER BY cantidad_cursos DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset, `%${searchQuery}%`]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener el resumen de cursos por profesor:', err.message);
        res.status(500).json({ error: 'Error al obtener el resumen de cursos por profesor' });
    }
});

// Nueva ruta para obtener el número de proyectos subidos por curso con paginación
router.get('/proyectos/por-curso', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 3 } = req.query; // Parámetros para paginación con un límite de 3 resultados por defecto
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT cursos.id, cursos.nombre_curso, COUNT(proyectos.id) AS cantidad_proyectos
             FROM cursos
             LEFT JOIN proyectos ON cursos.codigo_curso = proyectos.codigo_curso
             GROUP BY cursos.id
             ORDER BY cantidad_proyectos DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener proyectos por curso:', err.message);
        res.status(500).json({ error: 'Error al obtener proyectos por curso' });
    }
});

// Nueva ruta para obtener las alertas y notificaciones del sistema (sin tabla "logs")
router.get('/alertas', verifyToken, async (req, res) => {
    try {
        // Ejemplo de consulta que devuelve solo solicitudes pendientes
        const result = await pool.query(`
            SELECT 'Solicitudes Pendientes' AS tipo_alerta, COUNT(*) AS cantidad
            FROM solicitudes
            WHERE status_solicitud = 'pendiente'
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener alertas:', err.message);
        res.status(500).json({ error: 'Error al obtener alertas' });
    }
});


module.exports = router;