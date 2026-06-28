import express from "express";
import { sequelize } from "../config/db.js";
import { db } from "../config/index.js";
import hashService from "./hash.service.js";
import jwtAccess from "./jwt_Access.service.js"
import jwtRefresh from "./jwt_Refresh.service.js"
import userModel from "../models/user.model.js";
import passwordService from "./password.service.js";


class AuthService {
    async signUp(userdata)
    {
        return await db.userModel.create(userdata);
    } 

    async signIn(userdata)
    {
        const { username, password } = userdata;

        const user = await db.userModel.findOne({ where: { username }});

        await passwordService.handleSigninAttempt(user, password);
        
        const accessToken = jwtAccess.create(user.id);
        const refreshToken = await jwtRefresh.create(user.id);
        
        return {accessToken: accessToken, refreshToken: refreshToken};
    }
}

export default new AuthService();