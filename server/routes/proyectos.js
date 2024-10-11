const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");
const { verifyToken } = require("../middleware/authMiddleware"); 

// Crear la carpeta si no existe
const createDirectoryIfNotExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Configurar Multer para almacenar archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const userId = req.user.id;

        // Ruta basada en año/mes/usuario
        const dir = path.join('C:\\Users\\pavip\\Documents\\Server', year, month, userId.toString());

        // Crear el directorio si no existe
        createDirectoryIfNotExists(dir);

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});


const upload = multer({ storage: storage });


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

// Ruta para obtener todos los proyectos
router.get("/atlas", verifyToken, async (req, res) => {
    try {
        const proyectos = await pool.query(
            `SELECT p.*, 
                    array_agg(DISTINCT a.nombre_autor) as autores, 
                    array_agg(DISTINCT t.nombre) as tecnologias 
             FROM proyectos p 
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id 
             LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id 
             LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id 
             GROUP BY p.id`
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

// Ruta para subir un archivo comprimido (para proyectos)
router.post("/subir", verifyToken, upload.single('archivoComprimido'), async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            descripcion_licencia,
            necesita_licencia,
            tipo,
            codigo_curso,
            usuario_id,
            tecnologias,
            categorias,
            autores
        } = req.body;

        const rutaArchivoComprimido = req.file ? req.file.path : null;

        // Verificar que tecnologías, categorías y autores sean arrays válidos
        const tecnologiasArray = JSON.parse(tecnologias);  // Convertir a arreglo
        const categoriasArray = JSON.parse(categorias);    // Convertir a arreglo
        const autoresArray = JSON.parse(autores);          // Convertir a arreglo
        let newProject;

        if (tipo === "aula") {
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

            // Registrar el proyecto de aula
            newProject = await pool.query(
                `INSERT INTO proyectos (titulo, descripcion, ruta_archivo_comprimido, descripcion_licencia, necesita_licencia, tipo, codigo_curso, usuario_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [titulo, descripcion, rutaArchivoComprimido, descripcion_licencia, necesita_licencia, tipo, codigo_curso, usuario_id]
            );
        } else if (tipo === "grado") {
            // Registrar el proyecto de grado
            newProject = await pool.query(
                `INSERT INTO proyectos (titulo, descripcion, ruta_archivo_comprimido, descripcion_licencia, necesita_licencia, tipo, usuario_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [titulo, descripcion, rutaArchivoComprimido, descripcion_licencia, necesita_licencia, tipo, usuario_id]
            );
        } else {
            return res.status(400).json({ error: "Tipo de proyecto no válido" });
        }

        const proyectoId = newProject.rows[0].id;

        // Asociar tecnologías y categorías en la base de datos (igual que antes)
        if (tecnologias && tecnologiasArray.length > 0) {
            for (const tecnologiaId of tecnologiasArray) {
                await pool.query(
                    `INSERT INTO proyectos_tecnologias (proyecto_id, tecnologia_id)
                    VALUES ($1, $2)`,
                    [proyectoId, tecnologiaId]
                );
            }
        }

        if (categorias && categoriasArray.length > 0) {
            for (const categoriaId of categoriasArray) {
                await pool.query(
                    `INSERT INTO proyectos_categorias (proyecto_id, categoria_id)
                    VALUES ($1, $2)`,
                    [proyectoId, categoriaId]
                );
            }
        }

        if (autores && autoresArray.length > 0) {
            for (const autor of autoresArray) {
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