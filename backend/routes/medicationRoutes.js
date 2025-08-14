const express = require("express");

module.exports = (controller, auth) => {
    const router = express.Router();
    router.use(auth);
    router.get("/", controller.list);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.remove);
    return router;
};
