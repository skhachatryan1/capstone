import jwtAccess from "../services/jwt_Access.service.js";
import JWTRefresh from "../services/jwt_Refresh.service.js";
import { db } from "../config/index.js";

class tokenValidator {

    accessTokenValidator(req, res, next)
    {
        try{
            const header = req.headers.authorization;

            if(!header)
            {
                const error = new Error("Invalid header");
                error.status = 401;
                throw error;
            }
            const token = header.split(" ")[1];
            if(!token)
            {
                const error = new Error("Invalid access token")
                error.status = 401;
                throw error;
            }
            const decoded = jwtAccess.verify(token); 

            req.user = decoded;
            return next()
        }catch(err)
        {
            next(err);
        }
    }

    refreshTokenValidator(req, res, next)
    {
        try {
            const refreshToken = req.body.refreshToken;
            const decoded = JWTRefresh.verify(refreshToken);
            if(!decoded)
            {
                const error = new Error("Invalid refresh token");
                error.status = 401;
                throw error;
            }
            req.user = decoded;
            return next();
        }catch(err) {
            next(err);
        }
    }

}

export default new tokenValidator();