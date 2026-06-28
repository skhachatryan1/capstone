import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
    await queryInterface.createTable("users", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name:           { type: DataTypes.STRING,  allowNull: false },
        email:          { type: DataTypes.STRING,  allowNull: false, unique: true },
        age:            { type: DataTypes.INTEGER },
        username:       { type: DataTypes.STRING,  allowNull: false, unique: true },
        password:       { type: DataTypes.STRING,  allowNull: false },
        failedAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
        lockedUntil:    { type: DataTypes.DATE,    allowNull: true },
        refreshToken:   { type: DataTypes.STRING,  allowNull: true },
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.dropTable("users");
}
