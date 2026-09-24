export const logger = (req, res, next) => {
    const startTime = Date.now();

    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);

    if (Object.keys(req.body || {}).length > 0) {
        console.log("[PAYLOAD]", req.body);
    }

    res.on("finish", () => {
        const responseTime = Date.now() - startTime;

        console.log(
            `[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`
        );
    });

    next();
};