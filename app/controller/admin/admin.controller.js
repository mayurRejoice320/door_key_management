const Users = require("../../models/users.model.js");
const DoorKey = require("../../models/door_keys.model.js");
const KeyAssignment = require("../../models/key_assignments.model.js");
const Role = require("../../models/roles.model.js");
const message = require("../../utils/message.js");
const { methods: commonServices } = require("../../services/common.js");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { ROLE } = require("../../utils/constant.js");
const AWSUpload = require("../../services/imgploads.js");

// admin login
exports.login = async (req, res) => {
  try {
    const { email_or_phone_no, password } = req.body;
    let query = {};
    let user = {};

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^\+?\d{10,15}$/;

    if (emailPattern.test(email_or_phone_no)) {
      query.email = email_or_phone_no;
      user = await Users.findOne(query);
      if (!user) {
        return res.status(400).json({ success: false, message: message.DATA_EXIST("This Email") });
      }
    } else if (phonePattern.test(email_or_phone_no)) {
      query.phone_no = email_or_phone_no;
      user = await Users.findOne(query);
      if (!user) {
        return res.status(400).json({ success: false, message: message.DATA_EXIST("This Phone") });
      }
    } else {
      return res.status(400).json({ success: false, message: message.INVALID("This Phone and Email is") });
    }

    if (!(await commonServices.comparePassword({ password, hashPwd: user?.password }))) {
      return res.status(400).json({ success: false, message: message.NOT_MATCH("Password") });
    }

    user = user.toJSON();
    console.log(typeof user, "----------------------- user type");

    const token = await commonServices.generateToken({ role_id: user.role_id, user_id: user._id });

    user.token = token;
    delete user.password;
    delete user.otp;
    delete user.is_delete;

    return res.status(201).json({ success: "true", message: message.LOG_IN, data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

// add project (new project user)
exports.addProject = async (req, res) => {
  try {
    const { full_name, email, phone_no, password, profile_image } = req.body;

    const isExist = await Users.findOne({ phone_no: phone_no });
    if (isExist) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This phone no") });
    }

    const role = await commonServices.findOne(Role, { role: ROLE.PROJECT, is_active: true });
    if (!role) {
      return res.status(400).json({ success: false, message: message.CREATION_RESTRICTED("New project") });
    }

    const obj = new Users({
      role_id: role._id,
      full_name: full_name,
      email: email,
      phone_no: phone_no,
      password: await commonServices.hashPassword({ password }),
      profile_image: profile_image ? profile_image : null,
      project_id: null,
    });

    const data = await obj.save();

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Project"), data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};
