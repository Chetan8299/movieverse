const { Router } = require("express");
const { register, login, logout, getUser, updateUser } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middlewares");

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/user", authenticate, getUser);
authRouter.put("/user", authenticate, updateUser);

module.exports = authRouter;
