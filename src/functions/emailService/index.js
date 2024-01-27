/****************************************************
 * EMAIL NOTIFICATION FUNCTIONS
 * Helper functions related to sending emails
 * Embedded JavaScript templates of emails are located in /views

 * randomStringGenerator: Returns random string for link expiration code
 * emailNotification: Sends email via SMTP
  - verifyEmail: Sends 
  - forgotPassword: Sends password recovery email
****************************************************/
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
const { WEB_URL, EMAIL_FROM, SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_PORT, BACK_END_URL } = process.env;

export default {
	randomStringGenerator() {
		let text = "";
		let possible = "0123456789";
		for (let i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	},
	
	async emailNotification(user, notifyType, messageDetails) {
		if (user) {
			const linkExpirationCode = await exports.default.randomStringGenerator();
			const transporter = await nodemailer.createTransport(
				{
					host: SMTP_HOST,
					secure: false,
					port: SMTP_PORT,
					auth: {
						user: SMTP_USERNAME,
						pass: SMTP_PASSWORD,
					},
				},
				(err, info) => {
					// if (err) console.log("Unable to send the mail :" + err.message);
				}
			);
			let code = linkExpirationCode;

			const mailOptions = {
				from: EMAIL_FROM,
				to: user?.email,
			};

			let obj = { fileName: "", subject: "" };

			switch (notifyType) {
				case "verifyEmail":
					obj.link = `${WEB_URL}/verify-email/${user?._id}_${linkExpirationCode}`;
					obj.fileName = "emailVerification";
					obj.subject = "Account Verification";
					break;
				case "forgotPassword":
					obj.link = `${WEB_URL}/reset-password/${user?._id}_${linkExpirationCode}`;
					obj.fileName = "forgotPassword";
					obj.subject = "Reset Password";
					break;
				case "invoice":
					obj.fileName = "invoice";
					obj.subject = "Purchase Invoice";
					break;
				default:
					break;
			}
			
			ejs.renderFile(
				path.join(__dirname, "./emailTemplets") + `/${obj?.fileName}.ejs`,
				{
					...messageDetails,
					firstName:user?.firstName,
					code,
					email:user?.email,
					link: obj?.link,
					WEB_URL,
					BACK_END_URL,
					EMAIL_FROM,
					date: new Date().toLocaleDateString(),
				},
				(err, data) => {
					mailOptions["subject"] = obj?.subject;
					mailOptions["html"] = data;

				}
			);

			const nodeMailorRes = await transporter.sendMail(mailOptions);
			if (nodeMailorRes) {
				return {
					flag: true,
					data: linkExpirationCode,
					message: nodeMailorRes.response,
				};
			} else return { flag: false };
		} else {
			return { flag: false };
		}
	},
};
