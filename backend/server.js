import "dotenv/config";
import http from "http";
import express from "express";
import app from "./app.js";
import { sequelize } from "./src/config/db.js";
import logger from "./src/lib/logger.js";
import { register } from "./src/lib/metrics.js";

const PORT = process.env.PORT || 5001;
const METRICS_PORT = process.env.METRICS_PORT || 9091;

const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");
});

// ── Metrics server (separate port, internal only) ─────────────────────────────
const metricsApp = express();
metricsApp.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});
const metricsServer = metricsApp.listen(METRICS_PORT, () => {
    logger.info({ port: METRICS_PORT }, "Metrics server started");
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
    logger.info({ signal }, "Shutdown signal received");

    metricsServer.close();
    server.close(async () => {
        logger.info("HTTP server closed");
        try {
            await sequelize.close();
            logger.info("Database connection closed");
            process.exit(0);
        } catch (err) {
            logger.error({ err }, "Error closing database connection");
            process.exit(1);
        }
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
        logger.error("Forced exit after shutdown timeout");
        process.exit(1);
    }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason }, "Unhandled promise rejection");
    process.exit(1);
});
