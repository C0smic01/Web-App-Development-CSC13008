module.exports = (sequelize,DataTypes)=>{
    
    const Role = sequelize.define('roles', {
        role_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        role_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    });
    Role.associate = (models)=>{
    
        Role.belongsToMany(models.users,{
            foreignKey : {name : 'role_id',allowNull : false},
            through : 'user_role',
            onDelete : 'CASCADE'
        })
    }
    
    return Role
}