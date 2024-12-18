const models = require('../../index');
const User = models.User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const EmailSender = require('../../utils/EmailSender');

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

            EmailSender.sendEmail(user, userData.host, 'emailVerification');

            return {
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                user
            };

        } catch (error) {
            console.error('Service - Registration error:', error);
            throw error;
        }
    }

    async verifyEmail(emailVerificationToken) {
        try {
            const decodedToken = jwt.verify(emailVerificationToken, process.env.JWT_SECRET);
            const user = await User.findOne({where: {user_id: decodedToken.user_id, token: emailVerificationToken}});

            if (!user) {
                return {
                    success: false,
                    message: 'Incorrect verification link. Please request a new one.'
                };
            }

            if (Date.now() > user.token_expired_at) {
                return {
                    success: false,
                    message: 'Verification link has expired. Please request a new one.'
                };
            }

            user.is_verified = true;
            user.token = null;
            user.token_expired_at = null;
            await user.save();

            return {
                success: true,
                message: 'Email verified successfully'
            };
        } catch (error) {
            console.error('Email verification error:', error);
            return {
                success: false,
                message: 'Incorrect verification link. Please request a new one'
            };
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
                    message: 'User not found with this email'
                };
            }

            EmailSender.sendEmail(user, host, 'passwordReset');
            
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

    async validateResetToken(passwordResetToken) {
        try {
            const decodedToken = jwt.verify(passwordResetToken, process.env.JWT_SECRET);
            const user = await User.findOne({where: {user_id: decodedToken.user_id, token: passwordResetToken}});
            if (!user) {
                return {
                    success: false,
                    message: 'Incorrect reset link. Please request a new one.'
                };
            }
            else if (user.token_expired_at < Date.now()) {
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

    async resetPassword(passwordResetToken, password) {
        try {
            const decodedToken = jwt.verify(passwordResetToken, process.env.JWT_SECRET);
            const user = await User.findOne({
                where: { 
                    user_id: decodedToken.user_id, 
                    token: passwordResetToken
                }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Incorrect reset link. Please request a new one.'
                };
            }

            if (Date.now() > user.token_expired_at) 
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
            user.token = null;
            user.token_expired_at = null;
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
                message: 'Incorrect reset link. Please request a new one'
            };
        }
    }
}

module.exports = new AuthService();