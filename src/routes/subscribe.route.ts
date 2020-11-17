import { Router } from "express"
import { subscribe } from "./../controllers/subscribe.controller"

const router = Router();

router.route("/:topic").post(subscribe)

export default router;