const profileService = require('../services/profileService');
const { validatePassword } = require('../../utils/ValidationRules');

class ProfileController {
    async getProfile(req, res, next) {
        try {
            const user = req.user;
            res.render('profile/profile', { user });
        } catch(error) {
            next(error);
        }
    }

    async postAvatar(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }
            
            const user_id = req.user.user_id;
            const avatarUrl = `/img/avatar/${req.file.filename}`;
            
            // Update the user's avatar in the database
            const response = await profileService.updateAvatar(user_id, avatarUrl);
            
            if (response.success) {
                res.json({
                    success: true,
                    message: 'Avatar uploaded successfully',
                    avatarUrl
                });
            } else {
                res.status(400).json(response);
            }
        } catch(error) {
            console.error('Controller - Avatar upload error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update avatar'
            });
        }
    }
    
    async postPassword(req, res, next) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const user_id = req.user.user_id;
    
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.render('profile/profile', { 
                    user: req.user,
                    error: 'All password fields are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.render('profile/profile', {
                    user: req.user,
                    error: 'New password do not match'
                });
            }

            const passwordValidation = validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return res.render('profile/profile', {
                    user: req.user,
                    error: passwordValidation.message
                });
            }

            const response = await profileService.updatePassword(user_id, currentPassword, newPassword);
            
            if (!response.success) {
                return res.render('profile/profile', {
                    user: req.user,
                    error: response.message
                });
            }

            res.render('profile/profile', {
                user: req.user,
                success: 'Password updated successfully'
            });

        } catch (error) {
            console.error('Controller - Password update error:', error);
            res.render('profile/profile', {
                user: req.user,
                error: 'An error occurred while updating password'
            });
        }
    }
}

module.exports = new ProfileController();