const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'hotmail', // Usa 'outlook' o 'hotmail' si tu universidad usa Microsoft
        auth: {
            user: process.env.EMAIL_USER, // Tu correo institucional
            pass: process.env.EMAIL_PASS, // Tu contraseña o app password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
    }
};

module.exports = sendEmail;
