const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// Ruta para crear un curso
router.post('/crearCurso', verifyToken, async (req, res) => {
    const { nombreCurso, periodo, fechaLimite, entregasLibres, codigoCurso } = req.body;
    const profesorId = req.user.id;  // Asumimos que el token contiene el id del profesor

    try {
        // Insertar el curso en la base de datos
        const nuevoCurso = await pool.query(
            `INSERT INTO cursos (nombre_curso, periodo, profesor_id, fecha_inicio, fecha_fin, codigo_curso) 
             VALUES ($1, $2, $3, now(), $4, $5) RETURNING *`,
            [nombreCurso, periodo, profesorId, fechaLimite || null, codigoCurso]
        );

        res.json({ curso: nuevoCurso.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al crear el curso' });
    }
});

// Ruta para obtener los cursos activos del profesor
router.get('/cursos', verifyToken, async (req, res) => {
    const profesorId = req.user.id;

    try {
        // Actualizar automáticamente el estado de los cursos si ha pasado la fecha límite
        await pool.query(
            `UPDATE cursos 
             SET estado = 'cerrado' 
             WHERE fecha_fin < NOW() AND estado = 'abierto'`
        );

        // Obtener los cursos del profesor ordenados por estado y fecha
        const cursos = await pool.query(
            `SELECT * FROM cursos 
             WHERE profesor_id = $1
             ORDER BY estado = 'abierto' DESC, fecha_fin ASC NULLS FIRST`,
            [profesorId]
        );

        res.json(cursos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener los cursos' });
    }
});

// Ruta para cerrar un curso
router.post('/cerrarCurso/:cursoId', verifyToken, async (req, res) => {
    const { cursoId } = req.params;

    try {
        const curso = await pool.query(
            `UPDATE cursos SET estado = 'cerrado', fecha_fin = NOW() WHERE id = $1 RETURNING *`,
            [cursoId]
        );
        res.json({ curso: curso.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al cerrar el curso' });
    }
});

// Ruta para abrir un curso
router.post('/abrirCurso/:cursoId', verifyToken, async (req, res) => {
    const { cursoId } = req.params;
    const { nuevaFechaLimite } = req.body;

    try {
        const curso = await pool.query(
            `UPDATE cursos SET estado = 'abierto', fecha_fin = $1 WHERE id = $2 RETURNING *`,
            [nuevaFechaLimite, cursoId]
        );
        res.json({ curso: curso.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al abrir el curso' });
    }
});

// Ruta para obtener los proyectos de un curso
router.get('/curso/:cursoId/proyectos', verifyToken, async (req, res) => {
    const { cursoId } = req.params;
    const profesorId = req.user.id;

    try {
        // Obtener el curso específico y verificar que el profesor tenga acceso
        const curso = await pool.query(
            `SELECT id, nombre_curso, codigo_curso 
             FROM cursos 
             WHERE id = $1 AND profesor_id = $2`,
            [cursoId, profesorId]
        );

        if (curso.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este curso' });
        }

        // Obtener los proyectos del curso con tecnologías y categorías
        const proyectos = await pool.query(
            `SELECT p.*, 
                    array_agg(DISTINCT a.nombre_autor) as autores,
                    array_agg(DISTINCT t.nombre) as tecnologias,
                    array_agg(DISTINCT c.nombre) as categorias
             FROM proyectos p
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
             LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
             LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
             LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
             LEFT JOIN categorias c ON pc.categoria_id = c.id
             WHERE p.codigo_curso = $1
             GROUP BY p.id`,
            [curso.rows[0].codigo_curso]
        );

        // Incluir el nombre del curso y el código en la respuesta
        res.json({ curso: curso.rows[0], proyectos: proyectos.rows });
    } catch (err) {
        console.error("Error al obtener los proyectos:", err.message);
        res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
});

// Validar código del curso
router.get("/validarCodigo/:codigoCurso", async (req, res) => {
    try {
        const curso = await pool.query(
            `SELECT nombre_curso, estado FROM cursos WHERE codigo_curso = $1`,
            [req.params.codigoCurso]
        );

        if (curso.rows.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        res.json(curso.rows[0]); // Devolver el nombre y estado del curso
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para obtener los cursos donde un alumno ha subido proyectos
router.get('/alumno/cursos', verifyToken, async (req, res) => {
    const alumnoId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT DISTINCT c.id, c.nombre_curso, c.codigo_curso, c.periodo, c.estado, c.fecha_fin
             FROM cursos c
             INNER JOIN proyectos p ON p.codigo_curso = c.codigo_curso
             WHERE p.usuario_id = $1`,
            [alumnoId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener los cursos del alumno:', err.message);
        res.status(500).json({ error: 'Error al obtener los cursos del alumno' });
    }
});

// Ruta para obtener los proyectos de un curso para los alumnos
router.get('/curso/:cursoId/proyectos/alumno', verifyToken, async (req, res) => {
    const { cursoId } = req.params;

    try {
        // Obtener el curso específico mediante el id del curso
        const curso = await pool.query(
            `SELECT id, nombre_curso, codigo_curso 
             FROM cursos 
             WHERE id = $1`,
            [cursoId]
        );

        if (curso.rows.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        // Obtener todos los proyectos asociados al curso mediante el codigo_curso
        const proyectos = await pool.query(
            `SELECT p.*, 
                    array_agg(DISTINCT a.nombre_autor) as autores,
                    array_agg(DISTINCT t.nombre) as tecnologias,
                    array_agg(DISTINCT c.nombre) as categorias
             FROM proyectos p
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
             LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
             LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
             LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
             LEFT JOIN categorias c ON pc.categoria_id = c.id
             WHERE p.codigo_curso = $1
             GROUP BY p.id`,
            [curso.rows[0].codigo_curso]
        );

        // Incluir el nombre del curso y el código en la respuesta
        res.json({ curso: curso.rows[0], proyectos: proyectos.rows });
    } catch (err) {
        console.error("Error al obtener los proyectos:", err.message);
        res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
});

module.exports = router;
