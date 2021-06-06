var express = require("express");

var userController = require("../Controller/userServices")

const multer = require('multer');
const uploadMiddleware = multer({}).single("image");

var router = express.Router();

// Dashboard Endpoints
router.get("/dashboard/getCustomer", userController.getCustomers);

router.get("/dashboard/getAdmins", userController.getAdmins)

router.get("/dashboard", userController.getDashboardPage);

// Chat Endpoints
router.get("/chat/:receiverId", userController.getConversation);

router.post("/chat", userController.chat);

// Delete Endpoints
router.delete("/deleteUser", userController.delete);

// Edit Endpoints
router.put("/edit", userController.edit);

router.patch("/edit", userController.updateUserProperty);

// Insert Endpoints
router.post("/insert", userController.insert);

router.post("/insert/profilePicture", uploadMiddleware, userController.insertProfilePicture);

// Email Endpoints
router.post("/email", userController.email);

module.exports = router;
