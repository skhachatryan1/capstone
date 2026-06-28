import express from "express";
import { sequelize } from "../config/db.js";
import { db } from "../config/index.js";



class UserService {
    async getAllUsers()
    {
        return await db.userModel.findAll()
    }

    async getUserById(id)
    {
        return await db.userModel.findByPk(id, {
            attributes: ['name', 'email', "age", "username"] 
        });
    }

    async getUser(id)
    {
        return await db.userModel.findByPk(id);
    }

    async putUserById(updates, id)
    {
        const user = await this.getUser(id);
        return await user.update(updates)
    }

    async patchUserById(updates, id)
    {
        const user = await this.getUser(id);
        return await user.update(updates);
    }

    async deleteUserById(id)
    {
        const user = await this.getUser(id);
        return await user.destroy();
    }
}

export default new UserService();