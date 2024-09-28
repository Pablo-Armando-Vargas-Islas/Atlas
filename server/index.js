const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const proyectosRoutes = require("./routes/proyectos");
const cursosRoutes = require('./routes/cursos');
const solicitudesRouter = require('./routes/solicitudes');
require('dotenv').config();
require('./cronJobs');


// Middleware
app.use(cors());
app.use(express.json());

// Rutas públicas
app.use("/api/auth", authRoutes);

// Rutas protegidas
app.use("/api/proyectos", proyectosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/solicitudes', solicitudesRouter);

// Endpoint de Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { correo_institucional, contraseña } = req.body;

        // Verificación de usuarios
        const user = await pool.query(
            "SELECT * FROM usuarios WHERE correo_institucional = $1",
            [correo_institucional]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "El correo o la contraseña no coinciden o son incorrectas" });
        }

        // Validación de contraseñas
        const validPassword = await bcrypt.compare(
            contraseña,
            user.rows[0].contraseña
        );

        if (!validPassword) {
            return res.status(401).json({ error: "El correo o la contraseña no coinciden o son incorrectas" });
        }

        // Generación de token
        const token = jwt.sign(
            { id: user.rows[0].id, rol_id: user.rows[0].rol_id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            mensaje: "Login exitoso",
            token,
            rol_id: user.rows[0].rol_id, // Rol del usuario
            usuario: user.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error del servidor" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});