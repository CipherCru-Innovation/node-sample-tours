/** @format */

import nodemailer from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Mail from 'nodemailer/lib/mailer';

export interface EmailOptions {
    template?: string;
    to: string;
    subject: string;
    text?: string;
}
export class Email {
    private transporter: nodemailer.Transporter;
    private transportOptions: SMTPTransport.Options;
    private from: string = `Natours <${process.env.EMAIL_FROM}>`;
    constructor() {
        const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } =
            process.env;
        this.transportOptions = {
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD
            },
            host: SMTP_HOST,
            port: 2525
        };
        this.transporter = nodemailer.createTransport(this.transportOptions);
    }

    public async send(options: EmailOptions) {
        //

        const html = pug.renderFile(
            `${__dirname}/../../views/emails/${options.template}.pug`
        );

        const mailOptions: Mail.Options = {
            from: this.from,
            to: options.to,
            subject: options.subject,
            html,
            text: options.text
        };

        await this.transporter.sendMail(mailOptions);
    }
}
