const models = require('../../index');
const User = models.User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../../config/email');
const dotenv = require('dotenv')

dotenv.config({path:'../config.env'})

class AuthService {
    async registerUser(userData) {
        try {
            const existingUser = await User.findOne({ 
                where: { email: userData.email } 
            });

            if (existingUser) {
                return {
                    success: false,
                    message: 'Email already registered'
                };
            }

            const user = await User.create({
                user_name: userData.user_name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password
            });

            return {
                success: true,
                message: 'Registration successful',
                user
            };

        } catch (error) {
            console.error('Service - Registration error:', error);
            throw error;
        }
    }

    async logoutUser(sessionStore, sessionId) {
        try {
            if (sessionStore && sessionId) {
                await sessionStore.destroy(sessionId);
            }
    
            return {
                success: true,
                message: 'Logout successful'
            };
        } catch (error) {
            console.error('Service - Logout error:', error);
            throw error;
        }
    }

    async forgotPassword(host, email) {
        try {
            const user = await User.findOne({where: {email: email}});
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            const token = jwt.sign({user_id: user.user_id}, process.env.JWT_SECRET);
            user.passwordResetToken = token;
            user.passwordResetExpires = Date.now() + 3600000;
            await user.save();

            const resetUrl = `http://${host}/auth/reset-password?token=${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
              `,
            };

            await transporter.sendMail(mailOptions);
            return {
                success: true,
                message: 'Password reset email sent'
            };
            
        }
        catch (error) {
            return {
                success: false,
                message: 'Error sending password reset email'
            };
        }
    }

    async validateResetToken(token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({where: {user_id: decodedToken.user_id, passwordResetToken: token}});
            if (!user) {
                return {
                    success: false,
                    message: 'Incorrect reset link. Please request a new one.'
                };
            }
            else if (user.passwordResetExpires < Date.now()) {
                return {
                    success: false,
                    message: 'Reset link has expired. Please request a new one.'
                };
            }

            return {
                success: true,
                message: 'Token is valid'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Incorrect reset link. Please request a new one.'
            };
        }
    };

    async resetPassword(token, password) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({
                where: { 
                    user_id: decodedToken.user_id, 
                    passwordResetToken: token
                }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Incorrect reset link. Please request a new one.'
                };
            }

            if (Date.now() > user.passwordResetExpires) 
            {
                return {
                    success: false,
                    message: 'Reset link has expired. Please request a new one.'
                };
            }

            const isOldPassword = await bcrypt.compare(password, user.password);
            if (isOldPassword) 
            {
                return {
                    success: false,
                    message: 'New password cannot be the same as the old password'
                };
            }

            user.password = password;
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            await user.save();

            return {
                success: true,
                message: 'Password reset successful'
            };
        }
        catch (error) {
            console.error('Reset password error:', error);
            return {
                success: false,
                message: 'Error resetting password'
            };
        }
    }
}

module.exports = new AuthService();