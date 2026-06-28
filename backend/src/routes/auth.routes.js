import express from "express";
import authValidator from "../middleware/auth.validator.js";
import userValidator from "../middleware/user.validator.js";
import authController from "../controllers/auth.controller.js";
import hashTransformator from "../middleware/hash.transform.js";
import tokenValidator from "../middleware/token.validator.js";


const authRouter = express.Router();

authRouter.post("/signup", 
    [authValidator.signUpParams, authValidator.uniqueAuth, authValidator.checkPassword, hashTransformator.hashTransform],
    authController.signup
);

authRouter.post("/signin", 
    [authValidator.signInParams, authValidator.userExist],
    authController.signIn
);

authRouter.post("/refresh", tokenValidator.refreshTokenValidator, authController.refresh);


export default authRouter;