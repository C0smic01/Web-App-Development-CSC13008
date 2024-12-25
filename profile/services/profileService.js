const models = require('../../index');
const User = models.User;
const multer = require('multer');
const path = require('path');
const util = require('util');

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/img/avatar');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${req.user.user_id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).single('avatar');

const uploadAsync = util.promisify(avatarUpload);

async function uploadAvatar(req, res) {
    try {
        await uploadAsync(req, res);
        return {
            success: true,
            message: 'Avatar uploaded successfully',
        };
    } catch (error) {
        console.error('Service - Upload avatar error:', error);
        return {
            success: false,
            message: error.message || 'Failed to upload avatar'
        };
    }
}

async function updateAvatar(user_id, avatarUrl) {
    try {
        if (!user_id || !avatarUrl) {
            return {
                success: false,
                message: 'Missing user_id or avatar URL'
            };
        }

        await User.update({ avatar: avatarUrl }, { where: { user_id } });

        return {
            success: true,
            message: 'Avatar updated successfully'
        };
    } catch (error) {
        console.error('Service - Update avatar error:', error);
        return {
            success: false,
            message: 'Failed to update avatar'
        };
    }
}

module.exports = {
    avatarUpload,
    uploadAvatar,
    updateAvatar
};