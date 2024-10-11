const express = require('express');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');


// Ruta para obtener todas las solicitudes (solo para administradores)
router.get('/', verifyToken, async (req, res) => {
    try {
        const solicitudes = await pool.query(
            `SELECT s.id, s.proyecto_id, s.solicitante_id, s.motivo, s.status_solicitud, s.fecha_solicitud, u.nombre, p.titulo
             FROM solicitudes s
             JOIN usuarios u ON s.solicitante_id = u.id
             JOIN proyectos p ON s.proyecto_id = p.id`
        );
        res.json(solicitudes.rows);
    } catch (err) {
        console.error("Error al obtener las solicitudes:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para crear una solicitud de acceso a un proyecto
router.post('/crear', verifyToken, async (req, res) => {
    const { proyecto_id, motivo } = req.body;
    const solicitante_id = req.user.id; 

    try {
        const nuevaSolicitud = await pool.query(
            `INSERT INTO solicitudes (proyecto_id, solicitante_id, motivo, status_solicitud, fecha_solicitud)
             VALUES ($1, $2, $3, 'pendiente', NOW()) RETURNING *`,
            [proyecto_id, solicitante_id, motivo]
        );

        res.json(nuevaSolicitud.rows[0]);
    } catch (err) {
        console.error("Error al crear la solicitud:", err.message);
        res.status(500).send("Error del servidor");
    }
});

// Ruta para aceptar una solicitud 
router.post('/solicitud/aceptar/:solicitudId', verifyToken, async (req, res) => {
    const { solicitudId } = req.params;
    const adminId = req.user.id;

    try {
        // Actualizar la solicitud a estado aceptado
        const solicitudAceptada = await pool.query(
            `UPDATE solicitudes SET status_solicitud = 'aceptada', respuesta_admin_id = $1, fecha_respuesta = NOW() 
             WHERE id = $2 RETURNING *`,
            [adminId, solicitudId]
        );

        if (solicitudAceptada.rows.length === 0) {
            return res.status(404).json({ error: "Solicitud no encontrada" });
        }

        // Obtener el correo del solicitante
        const solicitante = await pool.query(
            `SELECT u.correo_institucional
             FROM usuarios u
             JOIN solicitudes s ON u.id = s.solicitante_id
             WHERE s.id = $1`,
            [solicitudId]  // Usar solicitudId para obtener el solicitante
        );

        if (solicitante.rows.length === 0) {
            return res.status(404).json({ error: "Solicitante no encontrado" });
        }

        const correoSolicitante = solicitante.rows[0].correo_institucional;

        // Obtener el proyecto solicitado
        const proyecto = await pool.query(
            `SELECT p.ruta_archivo_comprimido
             FROM proyectos p
             WHERE p.id = $1`,
            [solicitudAceptada.rows[0].proyecto_id]
        );

        if (proyecto.rows.length === 0) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        const enlaceGitHub = proyecto.rows[0].ruta_archivo_comprimido;

        // Enviar correo al solicitante
        await sendEmail(
            correoSolicitante,
            "Acceso aprobado a proyecto",
            `¡Muy bien, tu solicitud ha sido aprovada! 

            Para acceder al código del archivo que solicitaste, por favor ve a la sección de "Mis Solicitudes", busca la solicitud correspondinet y da clic en "Descargar"

            IMPORTANTE:
            Recuerda que tienes unicamente 3 días para descargar el archivo, de lo contrario tendrás que hacer una nueva solicitud
            
            
            Saludos coordiales, Repositorio Atlas. `
        );

        res.json({ message: "Solicitud aceptada y correo enviado." });
    } catch (err) {
        console.error("Error al aceptar la solicitud:", err.message);
        res.status(500).send("Error del servidor");
    }
});


// Ruta para rechazar una solicitud
router.post('/solicitud/rechazar/:solicitudId', verifyToken, async (req, res) => {
    const { solicitudId } = req.params;
    const { comentarios } = req.body; // Comentarios del rechazo
    const adminId = req.user.id;

    try {
        // Actualizar la solicitud a estado rechazado
        const solicitudRechazada = await pool.query(
            `UPDATE solicitudes SET status_solicitud = 'rechazada', respuesta_admin_id = $1, fecha_respuesta = NOW(), comentarios = $2
             WHERE id = $3 RETURNING *`,
            [adminId, comentarios, solicitudId]
        );

        if (solicitudRechazada.rows.length === 0) {
            return res.status(404).json({ error: "Solicitud no encontrada" });
        }

        // Obtener el correo del solicitante
        const solicitante = await pool.query(
            `SELECT u.correo_institucional 
             FROM usuarios u
             JOIN solicitudes s ON u.id = s.solicitante_id
             WHERE s.id = $1`,
            [solicitudRechazada.rows[0].id]
        );

        if (solicitante.rows.length === 0) {
            return res.status(404).json({ error: "Solicitante no encontrado" });
        }

        const correoSolicitante = solicitante.rows[0].correo_institucional;

        // Enviar correo con el motivo del rechazo
        await sendEmail(
            correoSolicitante,
            "Acceso al proyecto denegado",
            `Lo sentimos, tu solicitud fué rechazada.
            
            Estimado usuario, lamentamos informarte que por el momento no podemos brindarte el acceso al código que solicitaste. 
            
            Motivo: ${comentarios}

            Saludos coordiales, Repositorio Atlas. `
        );

        res.json({ message: "Solicitud rechazada y correo enviado." });
    } catch (err) {
        console.error("Error al rechazar la solicitud:", err.message);
        res.status(500).send("Error del servidor");
    }
});


// Ruta para obtener las solicitudes del usuario autenticado (solicitante)
router.get('/misSolicitudes', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const solicitudes = await pool.query(
            `SELECT s.id, s.proyecto_id, s.motivo, s.status_solicitud, p.titulo, p.ruta_archivo_comprimido
             FROM solicitudes s
             JOIN proyectos p ON s.proyecto_id = p.id
             WHERE s.solicitante_id = $1`,
            [userId]
        );
        res.json(solicitudes.rows);
    } catch (err) {
        console.error("Error al obtener las solicitudes del usuario:", err.message);
        res.status(500).send("Error del servidor");
    }
});


// Ruta para descargar un archivo
router.get('/descargar/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Obtén la solicitud del usuario autenticado y verifica que esté aceptada
        const solicitud = await pool.query(
            `SELECT p.ruta_archivo_comprimido 
             FROM solicitudes s 
             JOIN proyectos p ON s.proyecto_id = p.id
             WHERE s.id = $1 AND s.solicitante_id = $2 AND s.status_solicitud = 'aceptada'`,
            [id, userId]
        );

        if (solicitud.rowCount === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada o acceso no autorizado' });
        }

        const rutaArchivo = solicitud.rows[0].ruta_archivo_comprimido;
        const nombreArchivo = path.basename(rutaArchivo); // Obtén el nombre del archivo original

        // Verifica si la ruta del archivo existe en el sistema de archivos
        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Descargar el archivo con su nombre original
        res.download(path.resolve(rutaArchivo), nombreArchivo, (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                res.status(500).send('Error al descargar el archivo');
            }
        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});



module.exports = router;
