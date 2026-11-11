import {
    ApiError
} from '../utils/ApiError.js';

export const createRateLimiter = ({
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests from this IP, please try again later.',
} = {}) => {
    const hits = new Map();

    // Periodically clean expired records every 5 minutes
    setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of hits.entries()) {
            if (now - record.resetTime > windowMs) {
                hits.delete(ip);
            }
        }
    }, 5 * 60 * 1000).unref();

    return (req, res, next) => {
        const ip = req.ip || req.connection ? .remoteAddress || 'unknown';
        const now = Date.now();
        const record = hits.get(ip);

        if (!record || now > record.resetTime) {
            hits.set(ip, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }

        record.count += 1;
        if (record.count > max) {
            res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
            return next(new ApiError(429, message));
        }

        next();
    };
};

export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

export const generalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Rate limit exceeded. Please try again later.',
});