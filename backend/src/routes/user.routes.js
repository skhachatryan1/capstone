import express from "express";
import UserController from "../controllers/user.controller.js";
import userValidator from "../middleware/user.validator.js";
import authValidator from "../middleware/auth.validator.js";

const userRouter = express.Router();

userRouter.get("/", UserController.getAllUsers);
userRouter.get("/me",
    UserController.getUserById
);

userRouter.delete("/me",
    UserController.deleteUserById
);

userRouter.patch("/me",
    userValidator.allFieldsEmptyValidator,
    UserController.patchUserById
);

userRouter.put("/me",
    userValidator.allFieldsFilledValidator,
    authValidator.uniqueAuth,
    UserController.putUserById
);

export default userRouter;