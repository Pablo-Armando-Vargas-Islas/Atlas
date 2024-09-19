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
        const cursos = await pool.query(
            `SELECT * FROM cursos WHERE profesor_id = $1 AND estado = 'abierto'`,
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
            `UPDATE cursos SET estado = 'cerrado' WHERE id = $1 RETURNING *`,
            [cursoId]
        );
        res.json({ curso: curso.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al cerrar el curso' });
    }
});

// Ruta para obtener los proyectos de un curso
router.get('/curso/:cursoId/proyectos', verifyToken, async (req, res) => {
    const { cursoId } = req.params;
    const profesorId = req.user.id;

    try {
        // Verificar que el curso pertenezca al profesor
        const curso = await pool.query(
            `SELECT * FROM cursos WHERE id = $1 AND profesor_id = $2`,
            [cursoId, profesorId]
        );

        if (curso.rows.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este curso' });
        }

        // Obtener los proyectos del curso
        const proyectos = await pool.query(
            `SELECT p.*, array_agg(a.nombre_autor) as autores 
             FROM proyectos p
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
             WHERE p.codigo_curso = $1
             GROUP BY p.id`,
            [curso.rows[0].codigo_curso]
        );

        res.json({ curso: curso.rows[0], proyectos: proyectos.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
});

// Validar código del curso
router.get('/validarCodigo/:codigoCurso', async (req, res) => {
    const { codigoCurso } = req.params;

    try {
        const curso = await pool.query(
            'SELECT * FROM cursos WHERE codigo_curso = $1',
            [codigoCurso]
        );

        if (curso.rows.length === 0) {
            return res.status(404).json({ error: 'El curso no existe' });
        }

        res.json(curso.rows[0]); // Devuelve el nombre del curso
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});



module.exports = router;
