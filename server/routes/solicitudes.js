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
            `SELECT s.id, s.proyecto_id, s.solicitante_id, s.motivo, s.status_solicitud, s.fecha_solicitud, 
                    u.nombre, r.nombre_rol AS rol, p.titulo
             FROM solicitudes s
             JOIN usuarios u ON s.solicitante_id = u.id
             JOIN roles r ON u.rol_id = r.id
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

        // Incrementar la popularidad del proyecto
        await pool.query(
            `UPDATE proyectos SET popularidad = popularidad + 1 WHERE id = $1`,
            [proyecto_id]
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
    const fechaLimiteDescarga = new Date();
    fechaLimiteDescarga.setDate(fechaLimiteDescarga.getDate() + 10); // 10 días de validez

    try {
        // Actualizar la solicitud a estado aceptado
        const solicitudAceptada = await pool.query(
            `UPDATE solicitudes SET status_solicitud = 'aceptada', 
             respuesta_admin_id = $1, fecha_respuesta = NOW(), fecha_limite_descarga = $2 
             WHERE id = $3 RETURNING *`,
            [adminId, fechaLimiteDescarga, solicitudId]
        );

        if (solicitudAceptada.rows.length === 0) {
            return res.status(404).json({ error: "Solicitud no encontrada" });
        }

        // Obtener el correo del solicitante y su nombre
        const solicitante = await pool.query(
            `SELECT u.correo_institucional, u.nombre
             FROM usuarios u
             JOIN solicitudes s ON u.id = s.solicitante_id
             WHERE s.id = $1`,
            [solicitudId]
        );

        if (solicitante.rows.length === 0) {
            return res.status(404).json({ error: "Solicitante no encontrado" });
        }

        const correoSolicitante = solicitante.rows[0].correo_institucional;
        const nombreSolicitante = solicitante.rows[0].nombre;

        // Obtener el proyecto solicitado
        const proyecto = await pool.query(
            `SELECT p.titulo
             FROM proyectos p
             WHERE p.id = $1`,
            [solicitudAceptada.rows[0].proyecto_id]
        );

        if (proyecto.rows.length === 0) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        const tituloProyecto = proyecto.rows[0].titulo;

        // Enviar correo al solicitante
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4CAF50;">Acceso Aprobado al Proyecto</h2>
                <p>Estimado/a ${nombreSolicitante},</p>
                <p>Nos complace informarte que tu solicitud de acceso al proyecto <strong>"${tituloProyecto}"</strong> ha sido <strong>aprobada</strong>.</p>
                <p>Puedes acceder al proyecto visitando la sección de <strong>“Mis Solicitudes”</strong> y seleccionando la opción para descargar el archivo.</p>
                <p><strong>IMPORTANTE:</strong> Recuerda que tienes un periodo de <strong>10 días</strong> para descargar el archivo, de lo contrario, tendrás que realizar una nueva solicitud.</p>
                <p>Saludos cordiales,<br>Repositorio Atlas</p>
            </div>
        `;

        await sendEmail(
            correoSolicitante,
            "Acceso aprobado a proyecto",
            "Tu solicitud ha sido aprobada.", // Texto plano de respaldo
            htmlContent // Contenido HTML del correo
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

        // Obtener el correo del solicitante, su nombre y el título del proyecto solicitado
        const solicitante = await pool.query(
            `SELECT u.correo_institucional, u.nombre, p.titulo 
             FROM usuarios u
             JOIN solicitudes s ON u.id = s.solicitante_id
             JOIN proyectos p ON s.proyecto_id = p.id
             WHERE s.id = $1`,
            [solicitudId]
        );

        if (solicitante.rows.length === 0) {
            return res.status(404).json({ error: "Solicitante o proyecto no encontrado" });
        }

        const correoSolicitante = solicitante.rows[0].correo_institucional;
        const nombreSolicitante = solicitante.rows[0].nombre;
        const tituloProyecto = solicitante.rows[0].titulo;

        // Enviar correo con el motivo del rechazo
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #f44336;">Acceso Denegado al Proyecto</h2>
                <p style="color: #333;">Estimado/a ${nombreSolicitante},</p>
                <p style="color: #333;">Lamentamos informarte que tu solicitud de acceso al proyecto <strong>"${tituloProyecto}"</strong> ha sido <strong>denegada</strong>.</p>
                <p style="color: #333;"><strong>Motivo:</strong><br> ${comentarios}</p>
                <p style="color: #333;">Si tienes alguna duda, no dudes en ponerte en contacto con el administrador del sistema.</p>
                <p style="color: #333;">Saludos cordiales,<br>Repositorio Atlas</p>
            </div>
        `;

        await sendEmail(
            correoSolicitante,
            "Acceso al proyecto denegado",
            "Tu solicitud ha sido rechazada.", // Texto plano de respaldo
            htmlContent // Contenido HTML del correo
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
            `SELECT s.id, s.proyecto_id, s.motivo, s.status_solicitud, s.comentarios, s.fecha_solicitud, 
                p.titulo, p.ruta_archivo_comprimido,
                to_char(s.fecha_limite_descarga, 'YYYY-MM-DD"T"HH24:MI:SSZ') as fecha_limite_descarga
            FROM solicitudes s
            JOIN proyectos p ON s.proyecto_id = p.id
            WHERE s.solicitante_id = $1
            ORDER BY 
                CASE 
                    WHEN s.status_solicitud = 'pendiente' THEN 1
                    WHEN s.status_solicitud = 'abierto' THEN 2
                    ELSE 3
                END,
                s.fecha_solicitud DESC;`,
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
        // Obtén la solicitud del usuario autenticado y verifica que esté aceptada y vigente
        const solicitud = await pool.query(
            `SELECT p.ruta_archivo_comprimido, s.fecha_limite_descarga, s.status_solicitud, p.id as proyecto_id
             FROM solicitudes s 
             JOIN proyectos p ON s.proyecto_id = p.id
             WHERE s.id = $1 AND s.solicitante_id = $2`,
            [id, userId]
        );

        if (solicitud.rowCount === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada o acceso no autorizado' });
        }

        const { fecha_limite_descarga, status_solicitud, ruta_archivo_comprimido, proyecto_id } = solicitud.rows[0];
        const fechaLimite = new Date(fecha_limite_descarga);
        const hoy = new Date();

        // Verificar si la solicitud está en estado aceptado
        if (status_solicitud !== 'aceptada') {
            return res.status(400).json({ error: 'La solicitud no está en un estado válido para descargar' });
        }

        // Verificar si la fecha límite ha pasado
        if (hoy > fechaLimite) {
            return res.status(403).json({ error: 'El periodo de descarga ha expirado. Esta solicitud ya alcanzó el máximo de días disponible.' });
        }

        // Permitir la descarga si la solicitud aún está dentro del límite
        if (!fs.existsSync(ruta_archivo_comprimido)) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const nombreArchivo = path.basename(ruta_archivo_comprimido); // Obtén el nombre del archivo original

        // Incrementar el contador de descargas en la solicitud
        await pool.query(
            `UPDATE solicitudes SET descargas_count = descargas_count + 1 WHERE id = $1`,
            [id]
        );

        // Incrementar la relevancia del proyecto
        await pool.query(
            `UPDATE proyectos SET relevancia = relevancia + 1 WHERE id = $1`,
            [proyecto_id]
        );

        // Establecer la cabecera Content-Disposition antes de descargar el archivo
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

        // Descargar el archivo
        res.download(path.resolve(ruta_archivo_comprimido), nombreArchivo, (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                res.status(500).send('Error al descargar el archivo');
            }
        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para verificar si ya existe una solicitud pendiente para un proyecto específico
router.get('/verificar/:proyectoId', verifyToken, async (req, res) => {
    const { proyectoId } = req.params;
    const solicitante_id = req.user.id;

    try {
        const solicitudExistente = await pool.query(
            `SELECT * FROM solicitudes 
             WHERE proyecto_id = $1 AND solicitante_id = $2 AND status_solicitud = 'pendiente'`,
            [proyectoId, solicitante_id]
        );

        if (solicitudExistente.rows.length > 0) {
            return res.json({ pendiente: true });
        } else {
            return res.json({ pendiente: false });
        }
    } catch (err) {
        console.error("Error al verificar la solicitud:", err.message);
        res.status(500).send("Error del servidor");
    }
});




module.exports = router;
