import { sequelize } from "../config/db.js";

class HealthController {
    async check(req, res, next) {
        try {
            let dbStatus = "connected";
            try {
                await sequelize.query("SELECT 1");
            } catch {
                dbStatus = "unreachable";
            }

            const mem = process.memoryUsage();
            const toMB = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

            return res.status(200).json({
                status: dbStatus === "connected" ? "ok" : "degraded",
                uptime: Math.floor(process.uptime()),
                timestamp: new Date().toISOString(),
                database: dbStatus,
                memory: {
                    rss: toMB(mem.rss),
                    heapUsed: toMB(mem.heapUsed),
                    heapTotal: toMB(mem.heapTotal),
                },
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new HealthController();
