import { Router } from "express"

const router = Router();

router.route("/").post((req, res) => {
    console.log(req.body.message)

    res.json({
        status: "success"
    })
})

export default router;