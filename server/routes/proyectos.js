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

// Instancia de multer
const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 1 * 1024 * 1024 * 1024 }, // 1GB máximo
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/zip", 
            "application/x-zip-compressed",
            "image/png",
            "image/jpeg",
            "application/pdf"
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos .zip, .png, .jpg, .jpeg, o .pdf"));
        }
    }
});


// Ruta para obtener proyectos por usuario_id, con posibilidad de ordenar
router.get("/", verifyToken, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ error: "Usuario no autenticado" });
        }

        const usuario_id = req.user.id;
        const { orden } = req.query; // Obtenemos el criterio de orden de los parámetros de consulta

        // Determinar columna de orden
        let orderBy = 'p.fecha_hora DESC'; // Por defecto, ordenar por fecha reciente
        if (orden === 'popularidad') {
            orderBy = 'p.popularidad DESC';
        } else if (orden === 'relevancia') {
            orderBy = 'p.relevancia DESC';
        } else if (orden === 'antiguo') {
            orderBy = 'p.fecha_hora ASC'; // Ordenar por fecha más antigua
        }

        const proyectos = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                    p.ruta_archivo_comprimido, p.descripcion_licencia, p.necesita_licencia,
                    p.usuario_id,
                    array_agg(DISTINCT a.nombre_autor) as autores, 
                    array_agg(DISTINCT t.nombre) as tecnologias,
                    array_agg(DISTINCT c.nombre) as categorias,
                    cu.nombre_curso  -- Añadir el nombre del curso si está asociado
             FROM proyectos p 
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id 
             LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id 
             LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
             LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
             LEFT JOIN categorias c ON pc.categoria_id = c.id
             LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso  -- Unión para obtener el nombre del curso
             WHERE p.usuario_id = $1 
             GROUP BY p.id, cu.nombre_curso
             ORDER BY ${orderBy}`,
            [usuario_id]
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para obtener un proyecto específico por su ID
router.get("/proyecto/:id", verifyToken, async (req, res) => {
    try {
        const { id: proyecto_id } = req.params; // Obtener el proyecto_id de los parámetros de la URL

        if (!proyecto_id) {
            return res.status(400).json({ error: "ID de proyecto no proporcionado" });
        }

        const proyectos = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                    p.ruta_archivo_comprimido, p.codigo_curso, p.formato_aprobacion, p.descripcion_licencia, p.necesita_licencia,
                    p.usuario_id,
                    array_agg(DISTINCT a.nombre_autor) as autores, 
                    array_agg(DISTINCT t.id) as tecnologias,  -- Cambiado a t.id
                    array_agg(DISTINCT c.id) as categorias,   -- Cambiado a c.id
                    cu.nombre_curso  
             FROM proyectos p 
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id 
             LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id 
             LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
             LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
             LEFT JOIN categorias c ON pc.categoria_id = c.id
             LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso 
             WHERE p.id = $1
             GROUP BY p.id, cu.nombre_curso`,
            [proyecto_id]
        );

        if (proyectos.rows.length === 0) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        res.json(proyectos.rows[0]); // Devolver solo el proyecto encontrado
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});

//Ruta para actualizar un proyecto específico por su ID
router.put(
    "/proyecto/actualizar/:id",
    verifyToken,
    upload.fields([
        { name: "archivoComprimido", maxCount: 1 },
        { name: "formatoAprobacion", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { id: proyecto_id } = req.params;
            const {
                titulo,
                descripcion,
                descripcion_licencia,
                necesita_licencia,
                tipo,
                codigo_curso,
                tecnologias,
                categorias,
                autores,
            } = req.body;

            const usuario_id = req.user.id;

            // Manejar archivos
            const archivoComprimido = req.files?.archivoComprimido?.[0]?.path || null;
            const formatoAprobacion = req.files?.formatoAprobacion?.[0]?.path || null;

            // Validar campos
            if (!titulo || !descripcion || !tipo) {
                return res.status(400).json({ error: "Faltan campos obligatorios" });
            }

            // Parsear datos
            let tecnologiasArray = [];
            let categoriasArray = [];
            let autoresArray = [];

            try {
                tecnologiasArray = tecnologias ? JSON.parse(tecnologias).filter(tecnologia => tecnologia !== null) : [];
                categoriasArray = categorias ? JSON.parse(categorias).filter(categoria => categoria !== null) : [];
                autoresArray = autores ? JSON.parse(autores) : [];
            } catch (err) {
                console.error("Error al parsear datos:", err.message);
                return res.status(400).json({ error: "Datos mal formateados" });
            }

            // Actualizar proyecto
            let updatedProject;
            if (tipo === "aula") {
                updatedProject = await pool.query(
                    `UPDATE proyectos SET titulo = $1, descripcion = $2, ruta_archivo_comprimido = COALESCE($3, ruta_archivo_comprimido), descripcion_licencia = $4, necesita_licencia = $5, tipo = $6, codigo_curso = $7
                    WHERE id = $8 RETURNING *`,
                    [titulo, descripcion, archivoComprimido, descripcion_licencia, necesita_licencia, tipo, codigo_curso, proyecto_id]
                );
            } else if (tipo === "grado") {
                updatedProject = await pool.query(
                    `UPDATE proyectos SET titulo = $1, descripcion = $2, ruta_archivo_comprimido = COALESCE($3, ruta_archivo_comprimido), formato_aprobacion = COALESCE($4, formato_aprobacion), descripcion_licencia = $5, necesita_licencia = $6, tipo = $7
                    WHERE id = $8 RETURNING *`,
                    [titulo, descripcion, archivoComprimido, formatoAprobacion, descripcion_licencia, necesita_licencia, tipo, proyecto_id]
                );
            } else {
                return res.status(400).json({ error: "Tipo de proyecto no válido" });
            }

            // Asociar tecnologías, categorías y autores si son provistos
            if (tecnologiasArray.length > 0) {
                await pool.query(`DELETE FROM proyectos_tecnologias WHERE proyecto_id = $1`, [proyecto_id]);
                for (const tecnologiaId of tecnologiasArray) {
                    await pool.query(`INSERT INTO proyectos_tecnologias (proyecto_id, tecnologia_id) VALUES ($1, $2)`, [proyecto_id, tecnologiaId]);
                }
            }

            if (categoriasArray.length > 0) {
                await pool.query(`DELETE FROM proyectos_categorias WHERE proyecto_id = $1`, [proyecto_id]);
                for (const categoriaId of categoriasArray) {
                    await pool.query(`INSERT INTO proyectos_categorias (proyecto_id, categoria_id) VALUES ($1, $2)`, [proyecto_id, categoriaId]);
                }
            }

            if (autoresArray.length > 0) {
                await pool.query(`DELETE FROM proyectos_autores WHERE proyecto_id = $1`, [proyecto_id]);
                for (const autor of autoresArray) {
                    await pool.query(`INSERT INTO proyectos_autores (proyecto_id, nombre_autor) VALUES ($1, $2)`, [proyecto_id, autor]);
                }
            }

            res.json(updatedProject.rows[0]);
        } catch (err) {
            console.error("Error en el servidor:", err);
            res.status(500).json({ error: "Error interno del servidor", details: err.message });
        }
    }
);


// Ruta para la búsqueda global de proyectos
router.get("/atlas", verifyToken, async (req, res) => {
    try {
        const query = req.query.query || '';  // Parámetro de búsqueda
        const orden = req.query.orden || 'reciente';  // Parámetro de orden

        // Si la consulta está vacía, no aplicar condiciones específicas
        let searchConditions = 'TRUE';
        let queryParams = [];  // Para almacenar los parámetros de consulta

        if (query.trim()) {
            const keywords = query.split(' ').filter(Boolean);
            searchConditions = keywords.map((keyword, index) => {
                queryParams.push(`%${keyword}%`);
                return `(
                    unaccent(p.titulo) ILIKE unaccent($${queryParams.length})
                    OR unaccent(p.tipo) ILIKE unaccent($${queryParams.length})
                    OR p.fecha_hora::text ILIKE unaccent($${queryParams.length})
                    OR unaccent(a.nombre_autor) ILIKE unaccent($${queryParams.length})
                    OR unaccent(t.nombre) ILIKE unaccent($${queryParams.length})
                    OR unaccent(c.nombre) ILIKE unaccent($${queryParams.length})
                    OR unaccent(p.descripcion) ILIKE unaccent($${queryParams.length})
                )`;
            }).join(' AND ');
        }

        // Determinar columna de orden
        let orderBy;
        switch (orden) {
            case 'antiguo':
                orderBy = 'p.fecha_hora ASC';
                break;
            case 'popularidad':
                orderBy = 'p.popularidad DESC';
                break;
            case 'relevancia':
                orderBy = 'p.relevancia DESC';
                break;
            case 'reciente':
            default:
                orderBy = 'p.fecha_hora DESC';
                break;
        }

        // Consulta SQL que devuelve todos los proyectos
        const proyectos = await pool.query(
            `WITH proyecto_filtrado AS (
                SELECT DISTINCT p.id
                FROM proyectos p
                LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id 
                LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id 
                LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id 
                LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
                LEFT JOIN categorias c ON pc.categoria_id = c.id
                WHERE ${searchConditions}
            )
            SELECT p.*, 
                   array_agg(DISTINCT a.nombre_autor) as autores, 
                   array_agg(DISTINCT t.nombre) as tecnologias,
                   array_agg(DISTINCT c.nombre) as categorias,
                   cu.nombre_curso  -- Obtener el nombre del curso si el proyecto está asociado a un curso
            FROM proyectos p
            LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
            LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
            LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
            LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
            LEFT JOIN categorias c ON pc.categoria_id = c.id
            LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso  -- Unión con la tabla cursos para obtener el nombre del curso
            WHERE p.id IN (SELECT id FROM proyecto_filtrado)
            GROUP BY p.id, cu.nombre_curso
            ORDER BY ${orderBy}`,
            queryParams
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
router.post(
    "/subir",
    verifyToken,
    upload.fields([
        { name: "archivoComprimido", maxCount: 1 },
        { name: "formatoAprobacion", maxCount: 1 },
    ]),
    async (req, res) => {
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

            const archivoComprimido = req.files['archivoComprimido'] ? req.files['archivoComprimido'][0].path : null;
            const formatoAprobacion = req.files['formatoAprobacion'] ? req.files['formatoAprobacion'][0].path : null;

            // Verificar y parsear arrays
            let tecnologiasArray = [];
            let categoriasArray = [];
            let autoresArray = [];
            try {
                tecnologiasArray = tecnologias ? JSON.parse(tecnologias) : [];
                categoriasArray = categorias ? JSON.parse(categorias) : [];
                autoresArray = autores ? JSON.parse(autores) : [];
            } catch (err) {
                return res.status(400).json({ error: "Datos mal formateados" });
            }
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
                    [titulo, descripcion, archivoComprimido, descripcion_licencia, necesita_licencia, tipo, codigo_curso, usuario_id]
                );
            } else if (tipo === "grado") {
                // Registrar el proyecto de grado con formato de aprobación
                newProject = await pool.query(
                    `INSERT INTO proyectos (titulo, descripcion, ruta_archivo_comprimido, formato_aprobacion, descripcion_licencia, necesita_licencia, tipo, usuario_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                    [titulo, descripcion, archivoComprimido, formatoAprobacion, descripcion_licencia, necesita_licencia, tipo, usuario_id]
                );
            } else {
                return res.status(400).json({ error: "Tipo de proyecto no válido" });
            }

            const proyectoId = newProject.rows[0].id;

            // Asociar tecnologías, categorías y autores
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

// Ruta para validar si el titulo del proyecto ya existe
router.get("/titulo-existe", verifyToken, async (req, res) => {
  try {
      const { titulo } = req.query;

      const proyectoExistente = await pool.query(
          `SELECT id FROM proyectos WHERE titulo = $1`,
          [titulo]
      );

      if (proyectoExistente.rows.length > 0) {
          return res.json({ exists: true });
      } else {
          return res.json({ exists: false });
      }
  } catch (err) {
      console.error("Error al verificar el título del proyecto:", err.message);
      res.status(500).json({ error: "Error del servidor" });
  }
});

// Ruta para obtener todos los proyectos sin filtros
router.get("/todos", verifyToken, async (req, res) => {
    try {
        const proyectos = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                    p.ruta_archivo_comprimido,
                    p.descripcion_licencia,
                    p.necesita_licencia,
                    p.usuario_id,
                    array_agg(DISTINCT a.nombre_autor) AS autores, 
                    array_agg(DISTINCT t.nombre) AS tecnologias,
                    array_agg(DISTINCT c.nombre) AS categorias,
                    cu.nombre_curso  -- Obtener el nombre del curso si aplica
             FROM proyectos p
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
             LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
             LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
             LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
             LEFT JOIN categorias c ON pc.categoria_id = c.id
             LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso  -- Unión con la tabla cursos
             GROUP BY p.id, cu.nombre_curso
             ORDER BY p.fecha_hora DESC`
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para la búsqueda de proyectos por título
router.get("/titulo", verifyToken, async (req, res) => {
    try {
        const query = req.query.query || '';
        const orden = req.query.orden || 'fecha'; // Obtener criterio de orden

        // Dividir la consulta en palabras clave
        const keywords = query.split(' ').filter(Boolean);

        // Crear una expresión para buscar cada palabra clave usando LIKE (discriminando mayúsculas y minúsculas) y usando unaccent para los acentos
        const searchConditions = keywords.length > 0 
        ? keywords.map(keyword => `unaccent(p.titulo) LIKE unaccent('%${keyword}%')`).join(' AND ')
        : 'TRUE';




        // Determinar columna de orden
        let orderBy = 'p.fecha_hora DESC'; // Por defecto, ordenar por fecha reciente
        if (orden === 'popularidad') {
            orderBy = 'p.popularidad DESC';
        } else if (orden === 'relevancia') {
            orderBy = 'p.relevancia DESC';
        } else if (orden === 'antiguo') {
            orderBy = 'p.fecha_hora ASC'; // Ordenar por fecha más antigua
        }

        // Consulta SQL que devuelve los proyectos que coinciden con el título
        const proyectos = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                    p.ruta_archivo_comprimido, p.descripcion_licencia, p.necesita_licencia, p.usuario_id,
                    array_agg(DISTINCT a.nombre_autor) AS autores, 
                    array_agg(DISTINCT t.nombre) AS tecnologias,
                    array_agg(DISTINCT c.nombre) AS categorias,
                    cu.nombre_curso  
             FROM proyectos p
             LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
             LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
             LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
             LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
             LEFT JOIN categorias c ON pc.categoria_id = c.id
             LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso 
             WHERE ${searchConditions}
             GROUP BY p.id, cu.nombre_curso
             ORDER BY ${orderBy}`,
            []
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para la búsqueda de proyectos por autor
router.get("/autor", verifyToken, async (req, res) => {
    try {
        const query = req.query.query || '';
        const orden = req.query.orden || 'fecha'; // Obtener criterio de orden

        // Dividir la consulta en palabras clave
        const keywords = query.split(' ').filter(Boolean);

        // Crear una subconsulta para buscar proyectos que tengan al menos un autor que coincida
        const searchConditions = keywords.length > 0
            ? keywords.map(keyword => `a.nombre_autor ILIKE '%${keyword}%'`).join(' OR ')
            : 'TRUE';

        // Determinar columna de orden
        let orderBy = 'p.fecha_hora DESC'; // Por defecto, ordenar por fecha reciente
        if (orden === 'popularidad') {
            orderBy = 'p.popularidad DESC';
        } else if (orden === 'relevancia') {
            orderBy = 'p.relevancia DESC';
        } else if (orden === 'antiguo') {
            orderBy = 'p.fecha_hora ASC'; // Ordenar por fecha más antigua
        }

        // Consulta SQL que devuelve los proyectos que coinciden con el autor y todos los datos asociados
        const proyectos = await pool.query(
            `WITH proyecto_filtrado AS (
                SELECT DISTINCT p.id
                FROM proyectos p
                LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
                WHERE ${searchConditions}
            )
            SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                   p.ruta_archivo_comprimido, p.descripcion_licencia, p.necesita_licencia, p.usuario_id,
                   array_agg(DISTINCT a.nombre_autor) AS autores, 
                   array_agg(DISTINCT t.nombre) AS tecnologias,
                   array_agg(DISTINCT c.nombre) AS categorias,
                   cu.nombre_curso  -- Obtener el nombre del curso si aplica
            FROM proyectos p
            LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
            LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
            LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
            LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
            LEFT JOIN categorias c ON pc.categoria_id = c.id
            LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso  -- Unión con la tabla cursos
            WHERE p.id IN (SELECT id FROM proyecto_filtrado)
            GROUP BY p.id, cu.nombre_curso
            ORDER BY ${orderBy}`
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para la búsqueda de proyectos por categoría
router.get("/categoria", verifyToken, async (req, res) => {
    try {
        const query = req.query.query || '';
        const orden = req.query.orden || 'fecha'; // Obtener criterio de orden

        // Dividir la consulta en palabras clave
        const keywords = query.split(' ').filter(Boolean);

        // Crear una subconsulta para buscar proyectos que tengan al menos una categoría que coincida
        const searchConditions = keywords.length > 0
            ? keywords.map(keyword => `c.nombre ILIKE '%${keyword}%'`).join(' OR ')
            : 'TRUE';

        // Determinar columna de orden
        let orderBy = 'p.fecha_hora DESC'; // Por defecto, ordenar por fecha reciente
        if (orden === 'popularidad') {
            orderBy = 'p.popularidad DESC';
        } else if (orden === 'relevancia') {
            orderBy = 'p.relevancia DESC';
        } else if (orden === 'antiguo') {
            orderBy = 'p.fecha_hora ASC'; // Ordenar por fecha más antigua
        }

        // Consulta SQL que devuelve los proyectos que coinciden con la categoría y todos los datos asociados
        const proyectos = await pool.query(
            `WITH proyecto_filtrado AS (
                SELECT DISTINCT p.id
                FROM proyectos p
                LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
                LEFT JOIN categorias c ON pc.categoria_id = c.id
                WHERE ${searchConditions}
            )
            SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                   p.ruta_archivo_comprimido, p.descripcion_licencia, p.necesita_licencia, p.usuario_id,
                   array_agg(DISTINCT a.nombre_autor) AS autores, 
                   array_agg(DISTINCT t.nombre) AS tecnologias,
                   array_agg(DISTINCT c.nombre) AS categorias,
                   cu.nombre_curso  -- Obtener el nombre del curso si aplica
            FROM proyectos p
            LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
            LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
            LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
            LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
            LEFT JOIN categorias c ON pc.categoria_id = c.id
            LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso  -- Unión con la tabla cursos
            WHERE p.id IN (SELECT id FROM proyecto_filtrado)
            GROUP BY p.id, cu.nombre_curso
            ORDER BY ${orderBy}`
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});
  
// Ruta para la búsqueda de proyectos por fecha
router.get("/fecha", verifyToken, async (req, res) => {
    try {
        const year = req.query.year || ''; // Obtener el año seleccionado
        const month = req.query.month || ''; // Obtener el mes seleccionado
        const orden = req.query.orden || 'fecha'; // Obtener criterio de orden

        // Crear condición de búsqueda de fecha
        let searchConditions = 'TRUE';
        if (year && month) {
            searchConditions = `EXTRACT(YEAR FROM p.fecha_hora) = ${year} AND EXTRACT(MONTH FROM p.fecha_hora) = ${month}`;
        } else if (year) {
            searchConditions = `EXTRACT(YEAR FROM p.fecha_hora) = ${year}`;
        }

        // Determinar columna de orden
        let orderBy = 'p.fecha_hora DESC'; // Por defecto, ordenar por fecha reciente
        if (orden === 'popularidad') {
            orderBy = 'p.popularidad DESC';
        } else if (orden === 'relevancia') {
            orderBy = 'p.relevancia DESC';
        } else if (orden === 'antiguo') {
            orderBy = 'p.fecha_hora ASC'; // Ordenar por fecha más antigua
        }

        // Consulta SQL que devuelve los proyectos que coinciden con la fecha y todos los datos asociados
        const proyectos = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                    p.ruta_archivo_comprimido, p.descripcion_licencia, p.necesita_licencia, p.usuario_id,
                    array_agg(DISTINCT a.nombre_autor) AS autores, 
                    array_agg(DISTINCT t.nombre) AS tecnologias,
                    array_agg(DISTINCT c.nombre) AS categorias,
                    cu.nombre_curso  -- Obtener el nombre del curso si aplica
            FROM proyectos p
            LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
            LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
            LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
            LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
            LEFT JOIN categorias c ON pc.categoria_id = c.id
            LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso  -- Unión con la tabla cursos
            WHERE ${searchConditions}
            GROUP BY p.id, cu.nombre_curso
            ORDER BY ${orderBy}`
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para obtener los años disponibles en los que hay proyectos registrados
router.get("/fecha/anos", verifyToken, async (req, res) => {
try {
    const años = await pool.query(
    `SELECT DISTINCT EXTRACT(YEAR FROM fecha_hora) AS año
    FROM proyectos
    ORDER BY año ASC`
    );

    res.json(años.rows.map(row => row.año));
} catch (err) {
    console.error("Error en el servidor al obtener los años:", err.message);
    res.status(500).send("Error del servidor");
}
});

// Ruta para obtener las  sugerencias de los cursos disponibles junto al nombre del profesor
router.get("/cursos/sugerencias", verifyToken, async (req, res) => {
    try {
        const query = req.query.query?.trim().toLowerCase();
        if (!query) {
            return res.status(400).send("Falta el parámetro de búsqueda.");
        }

        const cursos = await pool.query(
            `SELECT DISTINCT nombre_curso
            FROM cursos
            WHERE nombre_curso ILIKE $1
            ORDER BY nombre_curso ASC
            LIMIT 5`,
            [`${query}%`]
        );

        const nombresUnicos = cursos.rows.map(curso => curso.nombre_curso);
        res.json(nombresUnicos);
    } catch (err) {
        console.error("Error en el servidor al obtener sugerencias de cursos:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para obtener los nombres y códigos de los cursos disponibles
router.get("/cursos/nombres", verifyToken, async (req, res) => {
    try {
        const cursos = await pool.query(
            `SELECT DISTINCT nombre_curso, codigo_curso
            FROM cursos
            ORDER BY nombre_curso ASC`
        );

        res.json(cursos.rows);
    } catch (err) {
        console.error("Error en el servidor al obtener los cursos:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para la búsqueda de proyectos por curso (adaptada para nombres)
router.get("/curso", verifyToken, async (req, res) => {
    try {
        const curso = req.query.curso?.trim().toLowerCase();
        if (!curso) {
            console.log("No se recibió el parámetro de curso.");
            return res.status(400).send("Falta el parámetro de curso.");
        }

        const proyectos = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.fecha_hora, p.popularidad, p.relevancia, p.tipo,
                    p.ruta_archivo_comprimido, p.descripcion_licencia, p.necesita_licencia, p.usuario_id,
                    array_agg(DISTINCT a.nombre_autor) AS autores, 
                    array_agg(DISTINCT t.nombre) AS tecnologias,
                    array_agg(DISTINCT c.nombre) AS categorias,
                    cu.nombre_curso
            FROM proyectos p
            LEFT JOIN proyectos_autores a ON p.id = a.proyecto_id
            LEFT JOIN proyectos_tecnologias pt ON p.id = pt.proyecto_id
            LEFT JOIN tecnologias t ON pt.tecnologia_id = t.id
            LEFT JOIN proyectos_categorias pc ON p.id = pc.proyecto_id
            LEFT JOIN categorias c ON pc.categoria_id = c.id
            LEFT JOIN cursos cu ON cu.codigo_curso = p.codigo_curso
            WHERE LOWER(cu.nombre_curso) = $1
            GROUP BY p.id, cu.nombre_curso
            ORDER BY p.fecha_hora DESC`,
            [curso]
        );

        res.json(proyectos.rows);
    } catch (err) {
        console.error("Error en el servidor al obtener proyectos por curso:", err.message);
        res.status(500).send("Error del servidor");
    }
});

module.exports = router;