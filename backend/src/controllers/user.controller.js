import express from "express"
import usersService from "../services/user.service.js"
import userHelper from "../lib/helper.js";
import helper from "../lib/helper.js";
import userValidator from "../middleware/user.validator.js";

class UserController {

    async getAllUsers(req, res, next)
    {
        try
        {
            const users = await usersService.getAllUsers();
            if(!users || users.length === 0)
            {
                const error = new Error("Users not found");
                error.status = 404;
                throw error;
            }
            return res.json(users);
        }catch(err)
        {
            next(err);
        }
    }

    async getUserById(req, res, next)
    {
        try
        {
            const id = req.user.userId;
            const user = await usersService.getUserById(id);
            if(!user)
            {
                const error = new Error("User not found");
                error.status = 404;
                throw error;
            }
            return res.json(user);
        }catch(err)
        {
            next(err);
        }
    }

    async postNewUser(req, res, next)
    {
        try
        {
            const newUser = await usersService.postNewUser(req.body);
            if(!newUser)
            {
                const error = new Error("Failed to create a new user");
                error.status = 500;
                throw error;
            }
            return res.status(201).send("new user created\n");
        }catch(err)
        {
            next(err);
        }
    }

    async deleteUserById(req, res, next)
    {
        try
        {
            const id = req.user.userId
            const userDeleted = await usersService.deleteUserById(id);
            if(!userDeleted)
            {
                const error = new Error("Failed to delete a user");
                error.status = 500;
                throw error;
            }
            return res.status(200).send("user deleted");
        }catch(err)
        {
            next(err);
        }
    }

    async patchUserById(req, res, next)
    {
        try
        {
            const updates = req.body;
            const userId = req.user.userId;
            // console.log(req.user);
            const result =  await usersService.patchUserById(updates, userId);
            if(!result)
            {
                const error = new Error("Failed to patch");
                error.status = 500;
                throw error;
            }
            return res.status(200).send(result);
        }catch(err)
        {
            next(err);
        }
    }

    async putUserById(req, res, next)
    {
        try
        {
            const updates = req.body;
            const id = req.user.userId;
            const result = await usersService.putUserById(updates, id);
            if(!result)
            {
                const error = new Error("Failed to put");
                error.status = 500;
                throw error;
            }
            return res.status(200).send(result);
        }catch(err)
        {
            next(err);
        }
    }
}

export default new UserController();