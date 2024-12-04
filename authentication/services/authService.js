const models = require('../../index');
const User = models.User;
const bcrypt = require('bcryptjs');

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

    async loginUser(email, password) {
        try {
            const user = await User.findOne({ 
                where: { email },
                attributes: ['user_id', 'user_name', 'email', 'password'] 
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            return {
                success: true,
                message: 'Login successful',
                user: {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    email: user.email
                }
            };

        } catch (error) {
            console.error('Service - Login error:', error);
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
}

module.exports = new AuthService();