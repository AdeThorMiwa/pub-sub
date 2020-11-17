import { Router } from "express"
import { publish } from "./../controllers/publish.controller";

const router = Router();

router.route("/:topic").post(publish)

export default router;