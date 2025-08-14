const express = require("express");

module.exports = (authController) => {
    const router = express.Router();
    router.post("/signup", authController.signup);
    router.post("/login", authController.login);
    return router;
};
