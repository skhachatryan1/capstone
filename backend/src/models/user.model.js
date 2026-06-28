import { DataTypes, Model } from "sequelize";

export default function ( sequelize )
{
    class UsersModel extends Model {
        static associate(db)
        {
            UsersModel.hasMany(db.postModel, {foreignKey: "user_id", as: "posts"});
        }
    }

    UsersModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        age: DataTypes.INTEGER,
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        failedAttempts: DataTypes.INTEGER,
        lockedUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },
        refreshToken: DataTypes.STRING
    }, {
        tableName: "users", 
        timestamps: false,
        sequelize
    })

    return UsersModel;
}