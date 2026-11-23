import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(5000),

    MONGODB_URI: z
        .string()
        .min(1, "MONGODB_URI is required"),

    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must contain at least 32 characters"),

    JWT_EXPIRES_IN: z
        .string()
        .min(1),

    RESET_TICKET_SECRET: z
        .string()
        .min(32, "RESET_TICKET_SECRET must contain at least 32 characters"),

    RESET_TICKET_EXPIRES_IN: z
        .string()
        .min(1),

    EMAIL_VERIFY_TICKET_SECRET: z
        .string()
        .min(
            32,
            "EMAIL_VERIFY_TICKET_SECRET must contain at least 32 characters",
        ),

    EMAIL_VERIFY_TICKET_EXPIRES_IN: z
        .string()
        .min(1),

    BCRYPT_SALT_ROUNDS: z.coerce
        .number()
        .int()
        .min(10)
        .max(15),

    OTP_EXPIRY_MINUTES: z.coerce
        .number()
        .int()
        .positive(),

    OTP_MAX_ATTEMPTS: z.coerce
        .number()
        .int()
        .positive(),

    BREVO_SMTP_HOST: z
        .string()
        .min(1),

    BREVO_SMTP_PORT: z.coerce
        .number()
        .int()
        .positive(),

    BREVO_SMTP_USER: z
        .string()
        .optional()
        .or(z.literal("")),

    BREVO_SMTP_KEY: z
        .string()
        .optional()
        .or(z.literal("")),

    EMAIL_FROM: z
        .string()
        .optional()
        .or(z.literal("")),

    CLIENT_URL: z
        .string()
        .url(),

    LOG_LEVEL: z
        .enum([
            "fatal",
            "error",
            "warn",
            "info",
            "debug",
            "trace",
            "silent",
        ])
        .default("info"),

    LOG_DIR: z
        .string()
        .min(1)
        .default("logs"),

    GLOBAL_WINDOW_MS: z.coerce
        .number()
        .int()
        .positive(),

    GLOBAL_MAX_REQUESTS: z.coerce
        .number()
        .int()
        .positive(),

    AUTH_WINDOW_MS: z.coerce
        .number()
        .int()
        .positive(),

});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:");

    console.error(
        parsedEnv.error.flatten().fieldErrors,
    );

    process.exit(1);
}

export const env = parsedEnv.data;