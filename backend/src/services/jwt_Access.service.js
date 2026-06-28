import jwt from "jsonwebtoken"

class JWTAccess {

    create(id)
    {
        return jwt.sign({userId: id}, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN});
    }

    verify(token)
    {
        try{
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return decoded;
        }catch(err)
        {
            const error = new Error("Invalid token");
            error.status = 401;
            throw error;
        }
    }

}

export default new JWTAccess();