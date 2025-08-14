const express = require("express");

module.exports = (controller, auth) => {
    const router = express.Router();
    router.use(auth);
    router.get("/", controller.getScores);
    router.post("/", controller.addScore);
    return router;
};
