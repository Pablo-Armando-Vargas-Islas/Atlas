const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');


// Obtener todos los usuarios
router.get('/usuarios', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT usuarios.id, usuarios.nombre, usuarios.correo_institucional, usuarios.rol_id, 
                    usuarios.cedula, usuarios.codigo_estudiante, roles.nombre_rol
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

        // Actualizar el usuario en la base de datos
        const result = await pool.query(
            `UPDATE usuarios 
             SET nombre = $1, correo_institucional = $2, rol_id = $3, cedula = $4, codigo_estudiante = $5, fecha_actualizacion = now()
             WHERE id = $6 RETURNING *`,
            [nombre, correo_institucional, rol_id, cedula, codigo_estudiante, id]
        );

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

// Eliminar un usuario y todas las relaciones dependientes
router.delete('/usuarios/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Primero eliminar todas las relaciones dependientes del usuario
        await pool.query('DELETE FROM solicitudes WHERE usuario_id = $1', [id]); 
        await pool.query('DELETE FROM proyectos WHERE usuario_id = $1', [id]); 
        await pool.query('DELETE FROM inscripciones WHERE usuario_id = $1', [id]);

        // Finalmente, eliminar el usuario
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length > 0) {
            res.json({ message: "Usuario eliminado exitosamente" });
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    } catch (err) {
        console.error("Error al eliminar el usuario:", err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});


module.exports = router;

