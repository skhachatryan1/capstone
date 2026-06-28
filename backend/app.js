import express from "express";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import cors from "cors";
import usersRouter from "./src/routes/user.routes.js";
import postsRouter from "./src/routes/post.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import healthRouter from "./src/routes/health.routes.js";
import metricsMiddleware from "./src/middleware/metrics.middleware.js";
import { globalErrorHandler } from "./src/error-handlers/globalErrorHandler.js";
import tokenValidator from "./src/middleware/token.validator.js";
import logger from "./src/lib/logger.js";

const app = express();

// ── Request logging ───────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const isTest = process.env.NODE_ENV === 'test';
const passThrough = (_req, _res, next) => next();

const globalLimiter = isTest ? passThrough : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, message: "Too many requests, please try again later." },
});

const authLimiter = isTest ? passThrough : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, message: "Too many auth attempts, please try again later." },
});

app.use(globalLimiter);
app.use(metricsMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/health", healthRouter);
app.use("/api/auth", authLimiter, authRouter);

app.use("/api/users", tokenValidator.accessTokenValidator, usersRouter);
app.use("/api/posts", tokenValidator.accessTokenValidator, postsRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;
    throw error;
});

app.use(globalErrorHandler);

export default app;
