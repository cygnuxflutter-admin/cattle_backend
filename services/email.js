/** 
 * emailService.js
 * @description :: exports function used in sending mails using mailgun provider
 */

const nodemailer = require('nodemailer');
const ejs = require('ejs');

// let transporter = nodemailer.createTransport({
//   service: 'Mailgun',
//   auth: {
//     user: process.env.MAILGUN_USER,
//     pass: process.env.MAILGUN_PASSWORD
//   }
// });

// Create a transporter for SMTP
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // replace with your SMTP host
  port: 587, // replace with your SMTP port (587 is a common port for TLS)
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAILGUN_USER,  // replace with your SMTP username
    pass: process.env.MAILGUN_PASSWORD // replace with your SMTP password
  }
});

const sendMail = async (obj) => {

  if (!Array.isArray(obj.to)) {
    obj.to = [obj.to];
  }

  let htmlText = '';
  if (obj.template) {
    // htmlText = await ejs.renderFile(`${__basedir}${obj.template}/html.ejs`, obj.data || null);
    htmlText = obj.template// await ejs.renderFile(`${__basedir}${obj.template}/html.ejs`, obj.data || null);
  }

  let mailOpts = {
    from: obj.from || 'noreply@cygnux.in',
    subject: obj.subject || 'Sample Subject',
    to: obj.to,
    cc: obj.cc || [],
    bcc: obj.bcc || [],
    html: htmlText,
    attachments: obj.attachments || []
  };

  return transporter.sendMail(mailOpts);
};

module.exports = { sendMail };
