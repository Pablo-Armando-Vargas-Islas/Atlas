const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const pool = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');


// Obtener proyectos de un curso específico
router.get('/cursos/proyectos/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si existe el curso antes de hacer la consulta de proyectos
        const cursoResult = await pool.query('SELECT codigo_curso FROM cursos WHERE id = $1', [id]);
        if (cursoResult.rows.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        const codigoCurso = cursoResult.rows[0].codigo_curso;

        // Obtener los proyectos del curso junto con tecnologías, categorías y autores
        const result = await pool.query(
            `SELECT 
                proyectos.id, 
                proyectos.titulo, 
                proyectos.descripcion, 
                proyectos.tipo, 
                proyectos.fecha_hora,
                proyectos.necesita_licencia,
                proyectos.descripcion_licencia,
                proyectos.ruta_archivo_comprimido,
                json_agg(DISTINCT tecnologias.nombre) AS tecnologias,
                json_agg(DISTINCT categorias.nombre) AS categorias,
                json_agg(DISTINCT proyectos_autores.nombre_autor) AS autores
             FROM proyectos
             LEFT JOIN proyectos_tecnologias ON proyectos.id = proyectos_tecnologias.proyecto_id
             LEFT JOIN tecnologias ON proyectos_tecnologias.tecnologia_id = tecnologias.id
             LEFT JOIN proyectos_categorias ON proyectos.id = proyectos_categorias.proyecto_id
             LEFT JOIN categorias ON proyectos_categorias.categoria_id = categorias.id
             LEFT JOIN proyectos_autores ON proyectos.id = proyectos_autores.proyecto_id
             WHERE proyectos.codigo_curso = $1
             GROUP BY proyectos.id
             ORDER BY proyectos.fecha_hora DESC`,
            [codigoCurso]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No se encontraron proyectos para este curso" });
        }

        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener los proyectos del curso:", err.message);
        res.status(500).json({ error: "Error al obtener los proyectos del curso" });
    }
});

// Actualizar un proyecto
router.put('/proyectos/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, necesita_licencia, descripcion_licencia } = req.body;

        const result = await pool.query(
            `UPDATE proyectos
             SET titulo = $1, descripcion = $2, necesita_licencia = $3, descripcion_licencia = $4
             WHERE id = $5 RETURNING *`,
            [titulo, descripcion, necesita_licencia, descripcion_licencia, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Proyecto no encontrado" });
        }
    } catch (err) {
        console.error("Error al actualizar el proyecto:", err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Obtener todos los usuarios
router.get('/usuarios', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT usuarios.id, usuarios.nombre, usuarios.correo_institucional, usuarios.rol_id, 
                    usuarios.cedula, usuarios.codigo_estudiante, usuarios.status_usuario, roles.nombre_rol
             FROM usuarios
             LEFT JOIN roles ON usuarios.rol_id = roles.id
             ORDER BY usuarios.fecha_creacion DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener los usuarios:", err.message);
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
});

// Actualizar la información de un usuario
router.put('/usuarios/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo_institucional, rol_id, cedula, codigo_estudiante } = req.body;

        // Verificar si el correo, la cédula, o el código de estudiante ya existen en otro usuario
        const checkResult = await pool.query(`
            SELECT * FROM usuarios 
            WHERE (correo_institucional = $1 OR cedula = $2 OR codigo_estudiante = $3) AND id <> $4
        `, [correo_institucional, cedula, codigo_estudiante, id]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: "El correo, la cédula, o el código de estudiante ya están en uso por otro usuario" });
        }

        // Obtener el rol actual del usuario para comparar si hubo un cambio de rol
        const userResult = await pool.query(`SELECT rol_id, cedula, codigo_estudiante FROM usuarios WHERE id = $1`, [id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const currentUser = userResult.rows[0];
        let newCedula = null;
        let newCodigoEstudiante = null;

        // Verificar si hubo un cambio de rol
        if (currentUser.rol_id !== rol_id) {
            if (rol_id === 2) {
                // Cambió a Docente - mover código de estudiante a cédula
                newCedula = currentUser.codigo_estudiante || cedula;
            } else if (rol_id === 3) {
                // Cambió a Alumno - mover cédula a código de estudiante
                newCodigoEstudiante = currentUser.cedula || codigo_estudiante;
            }
        } else {
            // Si no hubo cambio de rol, mantener los valores tal como se enviaron
            newCedula = cedula;
            newCodigoEstudiante = codigo_estudiante;
        }

        // Construir la consulta SQL para actualizar el usuario
        const query = `
            UPDATE usuarios 
            SET nombre = $1, correo_institucional = $2, rol_id = $3, cedula = $4, codigo_estudiante = $5, fecha_actualizacion = now()
            WHERE id = $6 RETURNING *`;
        const values = [nombre, correo_institucional, rol_id, newCedula, newCodigoEstudiante, id];

        // Ejecutar la consulta de actualización
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    } catch (err) {
        console.error("Error al actualizar el usuario:", err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Endpoint para inactivar un usuario
router.put('/usuarios/:id/inactivar', verifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query(
            'UPDATE usuarios SET status_usuario = $1 WHERE id = $2 RETURNING *',
            ['inactivo', userId]
        );

        if (result.rowCount > 0) {
            res.json({ message: 'Usuario inactivado correctamente', data: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al inactivar el usuario:', error.message);
        res.status(500).json({ error: 'Error al inactivar el usuario' });
    }
});

// Obtener todos los cursos
router.get('/cursos', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cursos.id, 
                    cursos.nombre_curso, 
                    cursos.profesor_id, 
                    usuarios.nombre AS nombre_profesor, 
                    COUNT(proyectos.id) AS cantidad_proyectos,
                    cursos.periodo,
                    cursos.fecha_inicio,
                    cursos.fecha_fin,
                    cursos.codigo_curso,
                    cursos.estado
             FROM cursos
             LEFT JOIN usuarios ON cursos.profesor_id = usuarios.id
             LEFT JOIN proyectos ON cursos.codigo_curso = proyectos.codigo_curso
             GROUP BY cursos.id, cursos.nombre_curso, cursos.profesor_id, usuarios.nombre, cursos.periodo, cursos.fecha_inicio, cursos.fecha_fin, cursos.codigo_curso, cursos.estado
             ORDER BY cursos.fecha_inicio DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener los cursos:", err.message);
        res.status(500).json({ error: "Error al obtener los cursos" });
    }
});

// Actualizar un curso
router.put('/cursos/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_curso,
            profesor_id,
            periodo,
            fecha_inicio,
            fecha_fin,
            codigo_curso,
            estado
        } = req.body;

        // Obtener el curso actual para verificar si existe y si tiene un profesor asignado
        const cursoResult = await pool.query(`SELECT profesor_id FROM cursos WHERE id = $1`, [id]);
        
        if (cursoResult.rows.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        // Si el profesor_id no se ha proporcionado en la solicitud, mantener el valor actual
        const currentProfesorId = cursoResult.rows[0].profesor_id;
        const updatedProfesorId = profesor_id !== undefined && profesor_id !== "" ? profesor_id : currentProfesorId;

        // Actualizar el curso en la base de datos
        const result = await pool.query(
            `UPDATE cursos 
             SET nombre_curso = $1, profesor_id = $2, periodo = $3, fecha_inicio = $4, fecha_fin = $5, codigo_curso = $6, estado = $7
             WHERE id = $8 RETURNING *`,
            [nombre_curso, updatedProfesorId, periodo, fecha_inicio, fecha_fin, codigo_curso, estado, id]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Curso no encontrado" });
        }
    } catch (err) {
        console.error("Error al actualizar el curso:", err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Obtener todos los usuarios con roles específicos
router.get('/usuariosRol', verifyToken, async (req, res) => {
    try {
        const roles = req.query.roles.split(',').map(Number);
        const result = await pool.query(
            `SELECT usuarios.id, usuarios.nombre, usuarios.correo_institucional, usuarios.rol_id, 
                    usuarios.cedula, usuarios.codigo_estudiante, roles.nombre_rol
             FROM usuarios
             LEFT JOIN roles ON usuarios.rol_id = roles.id
             WHERE usuarios.rol_id = ANY($1)
             ORDER BY usuarios.fecha_creacion DESC`,
            [roles]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener los usuarios:", err.message);
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
});

// Ruta para descargar un archivo de proyecto por el administrador
router.get('/descargar/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener la información del proyecto directamente
        const proyectoResult = await pool.query(
            `SELECT id, titulo, ruta_archivo_comprimido, tipo, formato_aprobacion
             FROM proyectos
             WHERE id = $1`,
            [id]
        );

        if (proyectoResult.rowCount === 0) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const { ruta_archivo_comprimido, tipo, formato_aprobacion } = proyectoResult.rows[0];

        // Verificar que el archivo comprimido existe
        if (!fs.existsSync(ruta_archivo_comprimido)) {
            return res.status(404).json({ error: 'Archivo comprimido no encontrado' });
        }

        const archivosAEnviar = [ruta_archivo_comprimido];
        let nombreArchivoPrincipal = path.basename(ruta_archivo_comprimido);

        // Si el proyecto es de tipo "grado", agregar el archivo de formato de aprobación
        if (tipo.toLowerCase() === 'grado' && formato_aprobacion) {
            if (!fs.existsSync(formato_aprobacion)) {
                return res.status(404).json({ error: 'Archivo de formato de aprobación no encontrado' });
            }
            archivosAEnviar.push(formato_aprobacion);
        }

        // Crear el directorio temporal si no existe
        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Crear un archivo zip con todos los archivos a descargar
        const zipFilePath = `${tempDir}/${id}_proyecto.zip`;

        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            res.setHeader('Content-Disposition', `attachment; filename="${id}_proyecto.zip"`);
            res.download(zipFilePath, `${id}_proyecto.zip`, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                    res.status(500).send('Error al descargar el archivo');
                } else {
                    // Eliminar el archivo zip después de la descarga
                    fs.unlinkSync(zipFilePath);
                }
            });
        });

        archive.on('error', (err) => {
            console.error('Error al crear el archivo zip:', err);
            res.status(500).send('Error al crear el archivo zip');
        });

        // Iniciar el proceso de archivado
        archive.pipe(output);
        archivosAEnviar.forEach((archivo) => {
            archive.file(archivo, { name: path.basename(archivo) });
        });
        archive.finalize();
    } catch (error) {
        console.error('Error al procesar la solicitud de descarga:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Endpoint para obtener la configuración de correo
router.get('/correo', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT email, password FROM email_config LIMIT 1');
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Configuración de correo no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la configuración de correo:', error.message);
        res.status(500).json({ error: 'Error al obtener la configuración de correo' });
    }
});

// Endpoint para actualizar o crear la configuración de correo
router.put('/correo/actualizar', verifyToken, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar si ya existe un registro de configuración de correo
        const checkResult = await pool.query('SELECT id FROM email_config LIMIT 1');

        if (checkResult.rows.length > 0) {
            // Si existe, actualizar el registro existente
            const updateResult = await pool.query(
                'UPDATE email_config SET email = $1, password = $2 WHERE id = $3',
                [email, password, checkResult.rows[0].id]
            );
            res.json({ message: 'Configuración de correo actualizada correctamente' });
        } else {
            // Si no existe, crear un nuevo registro
            const insertResult = await pool.query(
                'INSERT INTO email_config (email, password) VALUES ($1, $2) RETURNING *',
                [email, password]
            );
            res.json({ message: 'Configuración de correo creada correctamente', data: insertResult.rows[0] });
        }
    } catch (error) {
        console.error('Error al actualizar o crear la configuración de correo:', error.message);
        res.status(500).json({ error: 'Error al actualizar o crear la configuración de correo' });
    }
});

module.exports = router;

