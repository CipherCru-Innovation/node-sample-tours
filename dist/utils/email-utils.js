"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const pug_1 = __importDefault(require("pug"));
class Email {
    constructor() {
        this.from = `Natours <${process.env.EMAIL_FROM}>`;
        const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } = process.env;
        this.transportOptions = {
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD
            },
            host: SMTP_HOST,
            port: SMTP_PORT
        };
        this.transporter = nodemailer_1.default.createTransport(this.transportOptions);
    }
    async send(options) {
        //
        const html = pug_1.default.renderFile(`${__dirname}/../../views/emails/${options.template}.pug`);
        const mailOptions = {
            from: this.from,
            to: options.to,
            subject: options.subject,
            html,
            text: options.text
        };
        await this.transporter.sendMail(mailOptions);
    }
}
exports.Email = Email;
