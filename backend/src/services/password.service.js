import hashService from "./hash.service.js"

class passwordService {

    async handleSigninAttempt(user, password)
    {
        const originalPassword = user.password;

        await this.lockedUserHandler(user);

        const passwordCheck = await hashService.compare(password, originalPassword);
        if(!passwordCheck)
        {
            user.failedAttempts++;
            await user.save();

            await this.lockUser(user);

            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }
        
        user.failedAttempts = 0;
        await user.save();
    }

    async lockUser(user)
    {
        const failedAttempts = user.failedAttempts;
        if(failedAttempts >= 3)
        {
            user.lockedUntil = new Date(Date.now() + 1 * 60 * 1000);
            await user.save();
        }
    }

    async lockedUserHandler(user)
    {
        const lockedUntil = user.lockedUntil;
        if(lockedUntil && lockedUntil > new Date())
        {
            const error = new Error("user currently blocked");
            error.status = 403;
            throw error;
        }
    }
}

export default new passwordService();