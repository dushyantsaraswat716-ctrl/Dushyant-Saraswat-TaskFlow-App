import fs from "fs"
import path from "path"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import taskRouter from "./routes/task.Routes.js";
import authRouter from "./routes/auth.router.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorhandler.js";

const app = express()

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
}));
app.use("/uploads", express.static(uploadsDir));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRouter);
app.use("/api/task", taskRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
