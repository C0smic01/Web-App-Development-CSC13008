module.exports = (sequelize,DataTypes)=>{
    
    const UserRole = sequelize.define('user_role', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        timestamps: false
    });
    
    return UserRole
}