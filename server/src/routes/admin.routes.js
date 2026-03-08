const { Router } = require("express");
const { getUsers, banUser, unbanUser, deleteUser } = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middlewares/auth.middlewares");
const { validate } = require("../middlewares/validate.middleware");
const { userIdParam } = require("../validators/admin.validators");

const adminRouter = Router();

adminRouter.use(authenticate, authorize(["admin"]));

adminRouter.get("/users", getUsers);
adminRouter.patch("/users/:id/ban", [userIdParam], validate, banUser);
adminRouter.patch("/users/:id/unban", [userIdParam], validate, unbanUser);
adminRouter.delete("/users/:id", [userIdParam], validate, deleteUser);

module.exports = adminRouter;
