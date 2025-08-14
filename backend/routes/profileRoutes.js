const express = require("express");

module.exports = (controller, auth) => {
    const router = express.Router();
    router.use(auth);
    router.get("/me", controller.getMe);
    router.put("/me", controller.updateMe);
    return router;
};
