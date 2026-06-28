import jwt from "jsonwebtoken"
import { randomUUID } from "crypto"
import { db } from "../config/index.js"
import jwt_AccessService from "./jwt_Access.service.js";

class JWTRefresh {

    async create(id)
    {
        try{
            const token = jwt.sign({userId: id, jti: randomUUID()}, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN});
            const user = await db.userModel.findByPk(id)
            if(!user)
            {
                const error = new Error("user not found");
                error.status = 404;
                throw error;
            }
            user.refreshToken = token;
            await user.save();
            return token;
        }catch(err)
        {
            const error = new Error("Failed to create a refresh token");
            error.status = 500;
            throw error;
        }
    }

    verify(refreshToken)
    {
        try
        {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            return decoded;
        }catch(err)
        {
            const error = new Error("Invalid refresh token");
            error.status = 401;
            throw error;
        }  
    }

    async revoke(refreshToken)
    {
        try{
            const decoded = this.verify(refreshToken);
            const userId = decoded.userId;
            const user = await db.userModel.findByPk(userId);

            if (!user || user.refreshToken !== refreshToken) 
            {
                const error = new Error("Refresh token revoked");
                error.status = 401;
                throw error;
            }

            user.refreshToken = null;
            await user.save();
        }catch(err)
        {
            const error = new Error("Invalid refresh token");
            error.status = 401;
            throw error;
        }
    }

    async rotate(refreshToken)
    {
        try{
            const decoded = this.verify(refreshToken);
            const userId = decoded.userId;
            const user = await db.userModel.findByPk(userId);

            if(!user || refreshToken !== user.refreshToken)
            {
                const error = new Error("Refresh token revoked");
                error.status = 401;
                throw error;
            }
            await this.revoke(refreshToken);
            const newRefreshToken = await this.create(userId);
            user.refreshToken = newRefreshToken;
            await user.save();
            
            const newAccessToken = jwt_AccessService.create(userId);

            return {accessToken: newAccessToken, refreshToken: newRefreshToken};
        }catch(err)
        {
            console.error(err);
            const error = new Error(`Invalid refresh token: ${err.message}`);
            error.status = 401;
            throw error;

        }
    }
    
}
export default new JWTRefresh();

// Generate refresh tokens

// Store them

// Validate them

// Revoke them

// Rotate them

// Issue new access tokens