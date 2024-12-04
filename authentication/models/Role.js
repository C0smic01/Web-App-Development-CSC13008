module.exports = (sequelize,DataTypes)=>{
    
    const Role = sequelize.define('Role', {
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
        timestamps: false,
        tableName: 'roles'
    });
    Role.associate = (models)=>{
    
        Role.belongsToMany(models.User,{
            foreignKey : {name : 'role_id',allowNull : false},
            through : 'user_role',
            onDelete : 'CASCADE'
        })
    }
    
    return Role
}