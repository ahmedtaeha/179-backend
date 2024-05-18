const express = require("express");
const {
  getListOfUsers,
  addUser,
  updateUser,
  deleteUser,
} = require("../controllers/admin");
const {getRole} = require('./../middleware/getRole')

const router = express.Router();


router.get("/get-users",getRole , getListOfUsers);
router.post("/add-user",getRole, addUser);
router.put("/update-user/:id",getRole, updateUser);
router.delete("/delete-user/:id",getRole, deleteUser);

module.exports = router;
