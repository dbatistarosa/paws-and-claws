import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import bookingsRouter from "./bookings.js";
import adminRouter from "./admin.js";
import servicesRouter from "./services.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/bookings", bookingsRouter);
router.use("/admin", adminRouter);
router.use("/services", servicesRouter);

export default router;
