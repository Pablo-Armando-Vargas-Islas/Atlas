const express = require('express');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();
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

        // Obtener el proyecto solicitado y el correo del solicitante
        const proyecto = await pool.query(
            `SELECT p.ruta_archivo_comprimido, u.correo_institucional
             FROM proyectos p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.id = $1`,
            [solicitudAceptada.rows[0].proyecto_id]
        );

        if (proyecto.rows.length === 0) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        const correoSolicitante = proyecto.rows[0].correo_institucional;
        const enlaceGitHub = proyecto.rows[0].ruta_archivo_comprimido;

        // Enviar correo al solicitante
        await sendEmail(
            correoSolicitante,
            "Acceso aprobado a proyecto",
            `Tu solicitud ha sido aprobada. Aquí tienes el enlace al código: ${enlaceGitHub}`
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
            "Acceso rechazado a proyecto",
            `Tu solicitud ha sido rechazada. Motivo: ${comentarios}`
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




module.exports = router;
