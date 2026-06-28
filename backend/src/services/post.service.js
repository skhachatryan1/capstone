import express from "express";
import { sequelize } from "../config/db.js";
import { db } from "../config/index.js";

class PostService {
    async createNewPost(post)
    {
        return await db.postModel.create(post);
    }

    async getAllPosts()
    {
        return await db.postModel.findAll();
    }

    async getPostById(postId)
    {
        const post = await db.postModel.findByPk(postId);
        if(!post)
        {
            const error = new Error("post not found");
            error.status = 404;
            throw error;
        }
        return post;
    }

    async getPostsByUserId(userId)
    {
        const posts = await db.postModel.findAll({where: {user_id: userId}});
        if(posts.length === 0)
        {
            const error = new Error("post(s) not found");
            error.status = 404;
            throw error;
        }
        return posts;
    }

    async deletePostById(userId, postId)
    {
        const post = await this.getPostById(postId);
        if(post.user_id !== userId)
        {
            const error = new Error("post not found");
            error.status = 404;
            throw error;
        }
        await post.destroy();
        return true;
    }

    async patchPostById(update, userId, postId)
    {
        if ('user_id' in update) 
        {
            delete update.user_id;
        }


        const post = await this.getPostById(postId);
        if(post.user_id !== userId)
        {
            const error = new Error("post not found");
            error.status = 404;
            throw error;
        }

        for(const key in update)
        {
            if(update[key] === undefined)
            {
                delete update[key];
            }
        }

        return post.update(update);
    }

    async putPostById(update, userId, postId)
    {
        if ('user_id' in update) 
        {
            delete update.user_id;
        }

        const post = await this.getPostById(postId);
        if(post.user_id !== userId)
        {
            const error = new Error("post not found");
            error.status = 404;
            throw error;
        }

        const requiredFileds = ["title", "content"];
        for(const key of requiredFileds)
        {
            if(update[key] === undefined)
            {
                throw new Error("field must not be empty");
            }
        }

        return post.update(update);
    }

}

export default new PostService();