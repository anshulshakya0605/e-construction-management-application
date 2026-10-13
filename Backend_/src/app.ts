import express from "express";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import helmet from "helmet";
import { API, APP_CONFIG } from "./shared/constants";
import { pinoHttp } from "pino-http";
import logger from "./config/logger";
import authRouter from "./modules/auth/auth.routes.js";
import employeeRouter from './modules/employees/employee.routes.js'
import clientsRouter from './modules/clients/client.routes.js'
import inquiryRouter from './modules/inquiries/inquiry.routes.js'
import siteRouter from './modules/sites/site.routes.js'
import taskRouter from './modules/tasks/task.routes.js'


const app = express();

app.use(requestIdMiddleware);

app.use(helmet());

app.get("/", (req, res) => {
    req.log.info("Request received");
    
    res.json({
        requestId: req.id,
    });
});

app.use(express.json({
    limit: APP_CONFIG.JSON_BODY_LIMIT
}))

app.use(
    pinoHttp({
        logger,
        genReqId: (req) => req.id
    })
)

const apiRouter = express.Router();

app.use(
    API.BASE_PATH,
    apiRouter
)

app.get('/health', (req, res) => {
    res.json("Server health is good");
    
})

apiRouter.use(
    "/auth",
    authRouter,
);

apiRouter.use(
    '/employees',
    employeeRouter
)

apiRouter.use(
    '/clients',
    clientsRouter
)

apiRouter.use(
    '/inquiries',
    inquiryRouter
)

apiRouter.use(
    '/sites',
    siteRouter
)

apiRouter.use(
    '/tasks',
    taskRouter
)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app;