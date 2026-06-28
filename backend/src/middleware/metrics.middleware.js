import { httpRequestsTotal, httpRequestDurationSeconds } from "../lib/metrics.js";

export default function metricsMiddleware(req, res, next) {
  const startNs = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startNs) / 1e9;
    // Use the matched route pattern (e.g. /api/posts/me/:id) to avoid
    // high-cardinality labels from raw URLs with numeric IDs.
    const route = (req.baseUrl || "") + (req.route?.path || req.path || "unknown");
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  next();
}
