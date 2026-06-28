import { db } from "../config/index.js"
import helper from "../lib/helper.js"

class authValidator {

    async signUpParams(req, res, next)
    {
        try{
            const requiredFields =[ "name", "age", "username", "email", "password"];

            const update = req.body;
            const fields = helper.checkFields(update, requiredFields);
            if(!fields)
            {
                const error = new Error("no field must remain empty");
                error.status = 400;
                throw error;
            }
            return next()

        }catch(err)
        {
            next(err);
        }
    }

    async signInParams(req, res, next)
    {
        try{
            const requiredFields =["username", "password"];

            const update = req.body;
            const fields = helper.checkFields(update, requiredFields);
            if(!fields)
            {
                const error = new Error("no field must remain empty");
                error.status = 400;
                throw error;
            }
            return next()

        }catch(err)
        {
            next(err);
        }
    }

    async uniqueAuth(req, res, next)
    {
        try{
            
            const username = req.body.username;
            const email = req.body.email;

            const usernameFound = await db.userModel.findOne({
                where: { username }
            });
            const emailFound = await db.userModel.findOne({
                where: { email }
            });

            if(usernameFound)
            {
                return res.status(400).json({ok: false, message: "username already in use"});
            }
            if(emailFound)
            {
                return res.status(400).json({ok: false, message: "email already in use"});
            }

            next();

        }catch(err)
        {
            next(err);
        }
    }

    async userExist(req, res, next)
    {
        try{
            const { username } = req.body;
            const found = await db.userModel.findOne({ where: { username }});
            if(!found)
            {
                const error = new Error("user not found");
                error.status = 404;
                throw error;
            }
            return next();
        }catch(err)
        {
            next(err);
        }
    }

    async checkPassword(req, res, next)
    {
        try{
            const match = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
            const { password } = req.body;
            if(!match.test(password))
            {
                const error = new Error("password is too weak");
                error.status = 400;
                throw error;
            }
            return next();
        }catch(err)
        {
            next(err);
        }
    }
}

export default new authValidator();