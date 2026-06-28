import { db } from "../config/index.js"
import helper from "../lib/helper.js"

class UserValidator{
    
    async allFieldsFilledValidator(req, res, next)
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


    async allFieldsEmptyValidator(req, res, next)
    {
        try{
            const update = req.body;

            if(!update || Object.keys(update).length === 0)
            {
                return res.status(400).json({ok: false, message: "body must not remain empty"});
            }
            for(const key in update)
            {  
                if(update[key] === undefined || update[key] === null || update[key].toString().trim() === "")
                {
                    return res.status(400).json({ok: false, message: "body must not remain empty"});
                }
            }
            next();
        }catch(err)
        {
            next(err);
        }
    }

    async properParameters(req, res, next)
    {
        try{
            const id = Number(req.params.id);
            if(isNaN(id))
            {
                const error = new Error("Invalid ID parameter");
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

export default new UserValidator();