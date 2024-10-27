const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, htmlContent = null) => {
    const transporter = nodemailer.createTransport({
        service: 'outlook', // Proveedor: 'outlook' o 'hotmail' 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html: htmlContent,
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
