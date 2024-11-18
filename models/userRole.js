module.exports = (sequelize,DataTypes)=>{
    
    const UserRole = sequelize.define('UserRole', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        timestamps: false,
        tableName: 'user_role'
    });
    
    return UserRole
}