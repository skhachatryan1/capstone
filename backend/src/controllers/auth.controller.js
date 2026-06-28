import authService from "../services/auth.service.js";
import express from "express";
import jwt_RefreshService from "../services/jwt_Refresh.service.js";

class AuthController {
    async signup(req, res, next)
    {
        try{
            await authService.signUp(req.body);
            res.status(200).json({ok: true, message: "new user created"});
        }catch(err)
        {
            next(err);
        }
    }

    async signIn(req, res, next)
    {
        try{
            const decoded = await authService.signIn(req.body);
            const accessToken = decoded.accessToken;
            const refreshToken = decoded.refreshToken;
            res.status(200).json({ok: true, message: "signed in successfully", accessToken: accessToken, refreshToken: refreshToken});
        }catch(err)
        {
            next(err)
        }
    }

    async refresh(req, res, next)
    {
        try{
            const oldRefreshToken = req.body.refreshToken;
            const decoded = await jwt_RefreshService.rotate(oldRefreshToken);
            res.status(200).json({ok: true, accessToken: decoded.accessToken, refreshToken: decoded.refreshToken, message: "tokens renewed successfully"})
        }catch(err)
        {
            next(err);
        }
    }
}

export default new AuthController();