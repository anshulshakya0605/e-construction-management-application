import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import logger from "./config/logger.js";

const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();
        app.listen(env.PORT, () => {
            logger.info(
                {
                    port: env.PORT,
                },
                "Server started successfully",
            );
        });
        logger.info("E - Construction & Real Estate Management Backend Started");
    } catch (error) {
        logger.fatal(
            {
                error,
            },
            "Server startup failed",
        );

        process.exit(1);
    }
};

void startServer();