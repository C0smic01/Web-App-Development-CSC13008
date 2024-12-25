const profileService = require('../services/profileService');

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
}

module.exports = new ProfileController();