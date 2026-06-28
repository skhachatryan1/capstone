import hashService from "../services/hash.service.js";


class hashTransformator {

    async hashTransform(req, res, next)
    {
        const { password } = req.body;
        req.body.password = await hashService.hash(password);
        next();
    }
}

export default new hashTransformator();