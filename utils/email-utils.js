const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } = process.env;

const send = async (options) => {
    // Create a transporter
    console.info('--->', SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD);
    const transport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASSWORD
        }
    });

    // Configre the email to send.
    const mailOptions = {
        from: 'Natours <test@natours.com>',
        ...options
    };
    // send the email.
    await transport.sendMail(mailOptions);
};

module.exports = send;
