const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/authMiddleware"); 

// Ruta para obtener proyectos por usuario_id
router.get("/", verifyToken, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ error: "Usuario no autenticado" });
        }

        const usuario_id = req.user.id;

        const proyectos = await pool.query(
            `SELECT p.*, 
                    array_agg(DISTINCT a.nombre_autor) as autores, 
                    array_agg(DISTINCT t.nombre) as tecnologias 
            FROM proyectos p 
            LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id 
            LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id 
            LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id 
            WHERE p.usuario_id = $1 
            GROUP BY p.id`,
            [usuario_id]
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});


// Ruta para obtener tecnologías
router.get("/tecnologias", async (req, res) => {
    try {
        const tecnologias = await pool.query("SELECT * FROM tecnologias");
        res.json(tecnologias.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para obtener categorías
router.get("/categorias", async (req, res) => {
    try {
        const categorias = await pool.query("SELECT * FROM categorias");
        res.json(categorias.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error del servidor");
    }
});

// Crear un nuevo proyecto (pueden hacerlo estudiantes o docentes)
router.post("/subir", async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            ruta_archivo_comprimido,
            descripcion_licencia,
            necesita_licencia,
            tipo,
            codigo_curso,
            usuario_id,  
            tecnologias, 
            categorias,   
            autores
        } = req.body;

        // Verificar si el curso está cerrado
        const curso = await pool.query(
            `SELECT estado FROM cursos WHERE codigo_curso = $1`,
            [codigo_curso]
        );

        if (curso.rows.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        if (curso.rows[0].estado === 'cerrado') {
            return res.status(400).json({ error: "El curso ya está cerrado y no permite más entregas" });
        }

        // Registrar el proyecto
        const newProject = await pool.query(
            `INSERT INTO proyectos (titulo, descripcion, ruta_archivo_comprimido, descripcion_licencia, necesita_licencia, tipo, codigo_curso, usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [titulo, descripcion, ruta_archivo_comprimido, descripcion_licencia, necesita_licencia, tipo, codigo_curso, usuario_id]
        );

        const proyectoId = newProject.rows[0].id;

        // Asociar tecnologías
        if (tecnologias && tecnologias.length > 0) {
            for (const tecnologiaId of tecnologias) {
                await pool.query(
                    `INSERT INTO proyectos_tecnologias (proyecto_id, tecnologia_id)
                    VALUES ($1, $2)`,
                    [proyectoId, tecnologiaId]
                );
            }
        }

        // Asociar categorías
        if (categorias && categorias.length > 0) {
            for (const categoriaId of categorias) {
                await pool.query(
                    `INSERT INTO proyectos_categorias (proyecto_id, categoria_id)
                    VALUES ($1, $2)`,
                    [proyectoId, categoriaId]
                );
            }
        }

        // Insertar autores
        if (autores && autores.length > 0) {
            for (const autor of autores) {
                await pool.query(
                    `INSERT INTO proyectos_autores (proyecto_id, nombre_autor) VALUES ($1, $2)`,
                    [proyectoId, autor]
                );
            }
        }

        res.json(newProject.rows[0]);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});



        

module.exports = router;