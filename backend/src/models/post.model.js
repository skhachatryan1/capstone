import { DataTypes, Model } from "sequelize";

export default function(sequelize) 
{
    class PostModel extends Model{
        static associate(db)
        {
            PostModel.belongsTo(db.userModel, {foreignKey: "user_id", as: "author"});
        }
    }

    PostModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        content: DataTypes.TEXT
    }, {
        tableName: "posts", 
        timestamps: false,
        sequelize
    })
    return PostModel;
}