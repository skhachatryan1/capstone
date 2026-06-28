import express from "express"
import PostService from "../services/post.service.js"


class PostController {

    async postNewPost(req, res, next)
    {
        try{
            const userId = req.user.userId;
            const {title, content } = req.body;
            const payload = {user_id: userId, title: title, content: content}
            const newPost = await PostService.createNewPost(payload);
            if(!newPost)
            {
                const error = new Error("Failed to create a new post");
                error.status = 500;
                throw error;
            }
            return res.status(200).send({ok: true, message: "new post created"});
        }catch(err)
        {
            next(err);
        }
    }

    async getAllPosts(req, res, next)
    {
        try{
            const result = await PostService.getAllPosts();
            if(!result || result.length === 0)
            {
                const error = new Error("Post not found");
                error.status = 404;
                throw error;
            }
            return res.status(200).send(result);
        }catch(err)
        {
            next(err);
        }
    }

    async getPostsByUserId(req, res, next)
    {
        try{
            const userId = req.user.userId;
            const result = await PostService.getPostsByUserId(userId);
            if(!result)
            {
                const error = new Error("Post not found");
                error.status = 404;
                throw error;
            }
            return res.status(200).send(result);
        }catch(err)
        {
            next(err);
        }
    }

    async deletePostById(req, res, next)
    {
        try{
            const userId = req.user.userId;
            const postId = Number(req.params.id);
            const result = await PostService.deletePostById(userId, postId);
            if(!result)
            {
                const error = new Error("Failed to delete");
                error.status = 500;
                throw error;
            }
            
            return res.status(200).send({ok: true, message: "post deleted"});
        }catch(err)
        {
            next(err);
        }
    }

    async patchPostById(req, res, next)
    {
        try{
            const userId = req.user.userId;
            const postId = Number(req.params.id);
            const update = req.body;
            const result = await PostService.patchPostById(update, userId, postId);
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

    async putPostById(req, res, next)
    {
        try{
            const userId = req.user.userId;
            const postId = Number(req.params.id);
            const update = req.body;
            const result = await PostService.putPostById(update, userId, postId);
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


export default new PostController();