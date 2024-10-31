const nodemailer = require('nodemailer');
const pool = require('../db');

const sendEmail = async (to, subject, text, htmlContent = null) => {
    try {
        // Obtener la configuración de correo de la base de datos
        const configResult = await pool.query('SELECT email, password FROM email_config LIMIT 1');
        if (configResult.rows.length === 0) {
            throw new Error('Configuración de correo no encontrada');
        }

        const { email, password } = configResult.rows[0];

        const transporter = nodemailer.createTransport({
            service: 'outlook', // Proveedor: 'outlook' o 'hotmail' 
            auth: {
                user: email,
                pass: password,
            },
        });

        const mailOptions = {
            from: email,
            to,
            subject,
            text,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
    }
};

module.exports = sendEmail;
