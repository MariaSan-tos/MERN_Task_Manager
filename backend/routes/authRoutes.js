const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authControllers");
const { deleteUser } = require("../controllers/authControllers");  // Importe a função deleteUser
const { verifyAccessToken } = require("../middlewares.js/index.js");  // Importe o middleware para verificar o token

// Routes beginning with /api/auth
router.post("/signup", signup);
router.post("/login", login);
router.delete("/users", verifyAccessToken, deleteUser);


module.exports = router;
