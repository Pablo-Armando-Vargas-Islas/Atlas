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

// Ruta para obtener información completa de estudiantes y profesores activos en los últimos 7 días
router.get('/usuarios/activos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, nombre, correo_institucional AS email, rol_id, ultima_actividad, codigo_estudiante, cedula
             FROM usuarios 
             WHERE ultima_actividad >= NOW() - INTERVAL '7 days' AND (rol_id = 2 OR rol_id = 3)`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener usuarios activos:', err.message);
        res.status(500).json({ error: 'Error al obtener usuarios activos' });
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

// Ruta para obtener información completa de estudiantes y profesores inactivos
router.get('/usuarios/inactivos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT usuarios.id, usuarios.nombre, usuarios.correo_institucional, 
                    roles.nombre_rol AS nombre_rol, usuarios.ultima_actividad, 
                    usuarios.codigo_estudiante, usuarios.cedula
             FROM usuarios
             JOIN roles ON usuarios.rol_id = roles.id
             WHERE usuarios.status_usuario = 'inactivo' AND (usuarios.rol_id = 2 OR usuarios.rol_id = 3)`
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener usuarios inactivos:', err.message);
        res.status(500).json({ error: 'Error al obtener usuarios inactivos' });
    }
});

// Ruta para activar un usuario
router.put('/usuarios/:id/activar', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE usuarios 
             SET status_usuario = 'activo'
             WHERE id = $1 AND status_usuario = 'inactivo'
             RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado o ya activo' });
        }

        res.json({ message: 'Usuario activado correctamente', usuario: result.rows[0] });
    } catch (err) {
        console.error('Error al activar el usuario:', err.message);
        res.status(500).json({ error: 'Error al activar el usuario' });
    }
});

// Nueva ruta para obtener la cantidad de estudiantes inactivos
router.get('/estudiantes/inactivos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) AS cantidad 
             FROM usuarios 
             WHERE rol_id = 3 AND status_usuario = 'inactivo'`
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener estudiantes inactivos:', err.message);
        res.status(500).json({ error: 'Error al obtener estudiantes inactivos' });
    }
});

// Nueva ruta para obtener la cantidad de profesores inactivos
router.get('/profesores/inactivos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) AS cantidad 
             FROM usuarios 
             WHERE rol_id = 2 AND status_usuario = 'inactivo'`
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener profesores inactivos:', err.message);
        res.status(500).json({ error: 'Error al obtener profesores inactivos' });
    }
});

// Ruta para obtener los proyectos más solicitados
router.get('/proyectos/mas-solicitados', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.ruta_archivo_comprimido, p.descripcion_licencia, 
                    p.necesita_licencia, p.fecha_hora, p.tipo, p.popularidad, p.relevancia,
                    -- Subconsulta para obtener los autores sin duplicados
                    (SELECT json_agg(nombre_autor) 
                     FROM (
                        SELECT DISTINCT nombre_autor
                        FROM proyectos_autores
                        WHERE proyecto_id = p.id
                     ) sub_autores) AS autores,
                    -- Subconsulta para obtener las tecnologías sin duplicados
                    (SELECT json_agg(nombre) 
                     FROM (
                        SELECT DISTINCT t.nombre
                        FROM proyectos_tecnologias pt
                        JOIN tecnologias t ON t.id = pt.tecnologia_id
                        WHERE pt.proyecto_id = p.id
                     ) sub_tecnologias) AS tecnologias,
                    -- Subconsulta para obtener las categorías sin duplicados
                    (SELECT json_agg(nombre) 
                     FROM (
                        SELECT DISTINCT c.nombre
                        FROM proyectos_categorias pc
                        JOIN categorias c ON c.id = pc.categoria_id
                        WHERE pc.proyecto_id = p.id
                     ) sub_categorias) AS categorias
             FROM proyectos p
             ORDER BY p.popularidad DESC
             LIMIT 5`
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener proyectos más solicitados:', err.message);
        res.status(500).json({ error: 'Error al obtener proyectos más solicitados' });
    }
});

// Ruta para obtener los profesores con más cursos
router.get('/cursos/profesores/mas', verifyToken, async (req, res) => {
    try {
        // Obtener el rol_id correspondiente a 'Docente'
        const rolResult = await pool.query(
            `SELECT id FROM roles WHERE nombre_rol = 'Docente'`
        );

        if (rolResult.rows.length === 0) {
            throw new Error('No se encontró el rol "Docente"');
        }

        const rolId = rolResult.rows[0].id;

        const result = await pool.query(
            `SELECT u.nombre, u.correo_institucional, COUNT(c.id) AS cantidad_cursos
             FROM usuarios u
             LEFT JOIN cursos c ON c.profesor_id = u.id
             WHERE u.rol_id = $1
             GROUP BY u.id
             ORDER BY cantidad_cursos DESC
             LIMIT 5`,
            [rolId]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener los profesores con más cursos:', err.message);
        res.status(500).json({ error: 'Error al obtener los profesores con más cursos' });
    }
});

// Ruta para obtener los profesores con menos cursos
router.get('/cursos/profesores/menos', verifyToken, async (req, res) => {
    try {
        // Obtener el rol_id correspondiente a 'Docente'
        const rolResult = await pool.query(
            `SELECT id FROM roles WHERE nombre_rol = 'Docente'`
        );

        if (rolResult.rows.length === 0) {
            throw new Error('No se encontró el rol "Docente"');
        }

        const rolId = rolResult.rows[0].id;

        const result = await pool.query(
            `SELECT u.nombre, u.correo_institucional, COUNT(c.id) AS cantidad_cursos
             FROM usuarios u
             LEFT JOIN cursos c ON c.profesor_id = u.id
             WHERE u.rol_id = $1
             GROUP BY u.id
             ORDER BY cantidad_cursos ASC
             LIMIT 5`,
            [rolId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener los profesores con menos cursos:', err.message);
        res.status(500).json({ error: 'Error al obtener los profesores con menos cursos' });
    }
});

// Ruta para obtener los cursos con más proyectos
router.get('/cursos/mas-proyectos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.nombre_curso, COUNT(p.id) AS cantidad_proyectos
             FROM cursos c
             LEFT JOIN proyectos p ON p.codigo_curso = c.codigo_curso
             GROUP BY c.id, c.nombre_curso
             ORDER BY cantidad_proyectos DESC
             LIMIT 5`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener los cursos con más proyectos:', err.message);
        res.status(500).json({ error: 'Error al obtener los cursos con más proyectos' });
    }
});

// Ruta para obtener los cursos con menos proyectos
router.get('/cursos/menos-proyectos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.nombre_curso, COUNT(p.id) AS cantidad_proyectos
             FROM cursos c
             LEFT JOIN proyectos p ON p.codigo_curso = c.codigo_curso
             GROUP BY c.id, c.nombre_curso
             ORDER BY cantidad_proyectos ASC
             LIMIT 5`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener los cursos con menos proyectos:', err.message);
        res.status(500).json({ error: 'Error al obtener los cursos con menos proyectos' });
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