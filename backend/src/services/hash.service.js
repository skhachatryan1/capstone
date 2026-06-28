import bcrypt from "bcrypt"

class HashService {
    async compare(given, hashed)
    {
        return await bcrypt.compare(given, hashed);
    }

    async hash(original) {
        const salt = Number(process.env.SALT);
        return await bcrypt.hash(original, salt)
    }
}

export default new HashService();