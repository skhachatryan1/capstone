import { db } from "../config/index.js"

class PostValidator {

    async userExistsValidator(req, res, next)
    {
        try{
            const userId = req.user.userId;
            const user = await db.userModel.findOne({
                where: {id: userId}
            });

            if(!user)
            {
                return res.status(404).json({ok: false, message: "user not found"});
            }
            next()
        }catch(err)
        {
            next(err);
        }
    }

    contentValidator(req, res, next)
    {
        const { content } = req.body;
        if (!content || !String(content).trim()) {
            return res.status(400).json({ok: false, message: "content is required"});
        }
        next();
    }

    async useridChangeValidator(req, res, next)
    {
        try{
            const update = req.body;
            if("user_id" in update)
            {
                return res.status(403).json({ok: false, message: "changing user ID is forbidden"});
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

export default new PostValidator();