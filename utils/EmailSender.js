const transporter = require('../config/email');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({path:'../config.env'});


exports.sendEmail = async (user, host, actionPhrase) => {
    const token = jwt.sign({user_id: user.user_id}, process.env.JWT_SECRET);
    user.token = token;
    user.token_expired_at = Date.now() + 3600000;
    await user.save();

    if (actionPhrase === 'emailVerification') 
    {
        const url = `http://${host}/auth/verify-email?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Email Verification Request',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify Your Email</h2>
                <p>You requested an email verification. Click the link below to verify your email:</p>
                <a href="${url}" style="display: inline-block; background-color: #066557; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p>If you did not request this verification, please ignore this email.</p>
                <small>This link will expire in 1 hour.</small>
            </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    }
    else if (actionPhrase === 'passwordReset')
    {
        const url = `http://${host}/auth/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${url}" style="display: inline-block; background-color: #066557; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p>If you did not request a password reset, please ignore this email.</p>
                <small>This link will expire in 1 hour.</small>
            </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    }
}
