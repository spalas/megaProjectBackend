import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router();
// http://localhost:8000/api/v1/healthcheck

router.route("/").get(healthcheck);

export default router;