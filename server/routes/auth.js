const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
require('dotenv').config();

// Registro de Usuario
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

        // Verificar si el código de estudiante o la cédula ya existe
        if (rol_id === 3 && codigo_estudiante) {
            const existingStudentCode = await pool.query(
                "SELECT * FROM usuarios WHERE codigo_estudiante = $1",
                [codigo_estudiante]
            );
            if (existingStudentCode.rows.length > 0) {
                return res.status(401).json("El código de estudiante ya está registrado");
            }
        }

        if (rol_id === 2 && cedula) {
            const existingCedula = await pool.query(
                "SELECT * FROM usuarios WHERE cedula = $1",
                [cedula]
            );
            if (existingCedula.rows.length > 0) {
                return res.status(401).json("La cédula ya está registrada");
            }
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        // Insertar el nuevo usuario en la base de datos
        const newUser = await pool.query(
            `INSERT INTO usuarios (nombre, correo_institucional, contraseña, rol_id, codigo_estudiante, cedula) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, correo_institucional, hashedPassword, rol_id, codigo_estudiante || null, cedula || null]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error("Error en el registro:", err.message);
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

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "El usuario o la contraseña no coinciden o son incorrectos" });
        }

        // Validación de contraseñas
        const validPassword = await bcrypt.compare(
            contraseña,
            user.rows[0].contraseña
        );

        if (!validPassword) {
            return res.status(401).json({ error: "El correo o la contraseña no coinciden o son incorrectos" });
        }

        // Generar el token JWT
        const token = jwt.sign(
            {
                id: user.rows[0].id,
                rol_id: user.rows[0].rol_id,
                nombre: user.rows[0].nombre,
                correo_institucional: user.rows[0].correo_institucional,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // El token expirará en 1 hora
        );

        console.log("Token generado:", token);

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

module.exports = router;
