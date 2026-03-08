const { Router } = require("express");
const { register, login, logout, getUser, updateUser } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middlewares");
const { validate } = require("../middlewares/validate.middleware");
const { register: registerValidators, login: loginValidators, updateUser: updateUserValidators } = require("../validators/auth.validators");

const authRouter = Router();

authRouter.post("/register", registerValidators, validate, register);
authRouter.post("/login", loginValidators, validate, login);
authRouter.post("/logout", logout);
authRouter.get("/user", authenticate, getUser);
authRouter.put("/user", authenticate, updateUserValidators, validate, updateUser);

module.exports = authRouter;
