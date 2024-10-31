const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const sendEmail = require('../utils/sendEmail');
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { verifyToken } = require('../middleware/authMiddleware');
require('dotenv').config();

// Registro de usuario alumno
router.post("/register", async (req, res) => {
    try {
        const { nombre, correo_institucional, contraseña, rol_id, codigo_estudiante, cedula } = req.body;

        // Verificar si el correo institucional ya existe
        const user = await pool.query(
            "SELECT * FROM usuarios WHERE correo_institucional = $1",
            [correo_institucional]
        );

        if (user.rows.length > 0) {
            return res.status(401).json("El correo institucional ya está registrado");
        }

        // Verificar si la cédula o el código de estudiante ya existen
        if (cedula) {
            const existingCedulaOrStudentCode = await pool.query(
                "SELECT * FROM usuarios WHERE cedula = $1 OR codigo_estudiante = $1",
                [cedula]
            );
            if (existingCedulaOrStudentCode.rows.length > 0) {
                return res.status(401).json("La cédula ya está registrada");
            }
        }

        if (codigo_estudiante) {
            const existingStudentCodeOrCedula = await pool.query(
                "SELECT * FROM usuarios WHERE codigo_estudiante = $1 OR cedula = $1",
                [codigo_estudiante]
            );
            if (existingStudentCodeOrCedula.rows.length > 0) {
                return res.status(401).json("El código de estudiante ya está registrado");
            }
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        // Insertar el nuevo usuario en la base de datos con debe_cambiar_contrasena en false
        const newUser = await pool.query(
            `INSERT INTO usuarios (nombre, correo_institucional, contraseña, rol_id, codigo_estudiante, cedula, debe_cambiar_contrasena) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombre, correo_institucional, hashedPassword, rol_id, codigo_estudiante || null, cedula || null, false]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error("Error en el registro:", err.message);
        res.status(500).json("Error del servidor");
    }
});

// Registro de usuario admin/profesor
router.post("/registerAdmin", async (req, res) => {
    try {
        const { nombre, correo_institucional, rol_id, cedula } = req.body;

        // Verificar si el correo institucional ya existe
        const user = await pool.query(
            "SELECT * FROM usuarios WHERE correo_institucional = $1",
            [correo_institucional]
        );

        if (user.rows.length > 0) {
            return res.status(401).json("El correo institucional ya está registrado");
        }

        // Verificar si la cédula ya existe como cédula o código de estudiante
        const existingCedulaOrStudentCode = await pool.query(
            "SELECT * FROM usuarios WHERE cedula = $1 OR codigo_estudiante = $1",
            [cedula]
        );

        if (existingCedulaOrStudentCode.rows.length > 0) {
            return res.status(401).json("La cédula o el código de estudiante ya está registrado");
        }

        // Generar una contraseña temporal
        const tempPassword = Math.random().toString(36).slice(-8); // Generar una contraseña de 8 caracteres

        // Hashear la contraseña temporal
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // Insertar el nuevo usuario en la base de datos
        const newUser = await pool.query(
            `INSERT INTO usuarios (nombre, correo_institucional, contraseña, rol_id, cedula, debe_cambiar_contrasena) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, correo_institucional, hashedPassword, rol_id, cedula, true]
        );

        // Enviar correo al usuario con la contraseña temporal
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2>Bienvenido/a a Atlas</h2>
                <p>Estimado/a ${nombre},</p>
                <p>Tu cuenta ha sido creada exitosamente. Aquí tienes tus credenciales de acceso:</p>
                <p><strong>Usuario:</strong> ${cedula}</p>
                <p><strong>Contraseña:</strong> ${tempPassword}</p>
                <p>Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>
                <p>Saludos cordiales,<br>Repositorio Atlas</p>
            </div>
        `;

        await sendEmail(
            correo_institucional,
            "Bienvenido/a a Atlas - Credenciales de Acceso",
            "Tu contraseña temporal es: " + tempPassword,
            htmlContent
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error("Error en el registro del administrador:", err.message);
        res.status(500).json("Error del servidor");
    }
});

// Login de Usuario
router.post("/login", async (req, res) => {
    try {
        const { usuario, contraseña } = req.body;

        // Verificación de usuarios (puede ser por correo institucional, código de estudiante o cédula)
        const user = await pool.query(
            "SELECT * FROM usuarios WHERE codigo_estudiante = $1 OR cedula = $1",
            [usuario]
        );

        // Si no existe el usuario en la base de datos
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "El usuario aún no está registrado" });
        }

        // Validación de contraseñas
        const validPassword = await bcrypt.compare(
            contraseña,
            user.rows[0].contraseña
        );

        if (!validPassword) {
            return res.status(401).json({ error: "El usuario y la contraseña no coinciden" });
        }

        // Generar el token JWT
        const token = jwt.sign(
            {
                id: user.rows[0].id,
                rol_id: user.rows[0].rol_id,
                nombre: user.rows[0].nombre,
                correo_institucional: user.rows[0].correo_institucional,
                debe_cambiar_contrasena: user.rows[0].debe_cambiar_contrasena
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // El token expirará en 1 hora
        );

        // Actualizar la última actividad del usuario
        await pool.query(
            "UPDATE usuarios SET ultima_actividad = NOW() WHERE id = $1",
            [user.rows[0].id]
        );

        // Devolver el token y la información del usuario
        res.json({
            mensaje: "Login exitoso",
            token: token,
            usuario: {
                id: user.rows[0].id,
                nombre: user.rows[0].nombre,
                correo_institucional: user.rows[0].correo_institucional,
                rol_id: user.rows[0].rol_id,
                status_usuario: user.rows[0].status_usuario,
                fecha_creacion: user.rows[0].fecha_creacion,
                fecha_actualizacion: user.rows[0].fecha_actualizacion,
                debe_cambiar_contrasena: user.rows[0].debe_cambiar_contrasena
            }
        });
    } catch (err) {
        console.error("Error en el login:", err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Ruta para recuperar la contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { correo_institucional } = req.body;

        // Verificar si el correo institucional existe
        const user = await pool.query(
            "SELECT * FROM usuarios WHERE correo_institucional = $1",
            [correo_institucional]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "No existe una cuenta con ese correo" });
        }

        // Generar una contraseña temporal de 8 caracteres
        function generarContrasenaTemporal() {
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let contrasenaTemporal = '';
            for (let i = 0; i < 8; i++) {
                contrasenaTemporal += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            return contrasenaTemporal;
        }

        // Definir la contraseña temporal
        const tempPassword = generarContrasenaTemporal();

        // Hashear la contraseña temporal
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // Actualizar la contraseña y marcar debe_cambiar_contrasena como true
        await pool.query(
            `UPDATE usuarios 
             SET contraseña = $1, debe_cambiar_contrasena = true
             WHERE correo_institucional = $2`,
            [hashedPassword, correo_institucional]
        );

        // Enviar el correo electrónico con la contraseña temporal
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4CAF50;">Recuperación de Contraseña</h2>
                <p>Estimado/a ${user.rows[0].nombre},</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Tu nueva contraseña temporal es:</p>
                <p><strong>${tempPassword}</strong></p>
                <p>Por favor, utiliza esta contraseña para iniciar sesión y se te pedirá que la cambies inmediatamente.</p>
                <p>Saludos cordiales,<br>Repositorio Atlas</p>
            </div>
        `;

        await sendEmail(
            correo_institucional,
            "Recuperación de Contraseña - Atlas",
            "Tu nueva contraseña temporal es: " + tempPassword, // Respaldo de texto plano
            htmlContent // Contenido HTML del correo
        );

        res.json({ message: "Correo enviado" });
    } catch (err) {
        console.error("Error al recuperar contraseña:", err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Ruta para cambiar la contraseña
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { nueva_contraseña } = req.body;
        const userId = req.user.id;

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nueva_contraseña, salt);

        // Actualizar la contraseña en la base de datos
        const result = await pool.query(
            `UPDATE usuarios SET contraseña = $1, debe_cambiar_contrasena = false WHERE id = $2 RETURNING *`,
            [hashedPassword, userId]
        );

        if (result.rows.length > 0) {
            const usuario = result.rows[0];
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <h2>Actualización de Contraseña</h2>
                    <p>Estimado/a ${usuario.nombre},</p>
                    <p>Tu contraseña ha sido cambiada exitosamente. Si no fuiste tú quien realizó este cambio, por favor ponte en contacto con el administrador de inmediato.</p>
                    <p>Saludos cordiales,<br>Repositorio Atlas</p>
                </div>
            `;

            await sendEmail(
                usuario.correo_institucional,
                "Actualización de Contraseña - Atlas",
                "Tu contraseña ha sido cambiada", // Respaldo de texto plano
                htmlContent // Contenido HTML del correo
            );

            res.json({ message: "Contraseña actualizada exitosamente" });
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    } catch (err) {
        console.error("Error al actualizar la contraseña:", err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});

module.exports = router;
