const Users = require("../../models/users.model");
const DoorKey = require("../../models/door_keys.model");
const KeyAssignment = require("../../models/key_assignments.model");
const Role = require("../../models/roles.model");
const message = require("../../services/message");
const { methods: commonServices } = require("../../services/common");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { ROLE } = require("../../utils/constant");
const multer = require("multer");
const AWSUpload = require('../../services/imgploads.js')
var AWS = require('aws-sdk');

// Add User
exports.add = async (req, res) => {
  try {
    const { role_id, full_name, email, phone_no, password, profile_image, project_id } = req.body;
    const isExistingData = await Users.findOne({ phone_no: phone_no });
    if (isExistingData) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This User") });
    }

    if (project_id) {
      const findProjectId = await Users.findById(project_id);
      if (!findProjectId) {
        return res.status(400).json({ success: false, message: message.NO_DATA("This Project") });
      }
    }

    const obj = new Users({
      role_id: role_id,
      full_name: full_name,
      email: email,
      phone_no: phone_no,
      password: password,
      profile_image: null, // ✅ Storing QR Code URL as profile image
      project_id: project_id,
    });
    console.log(obj, '-------------obj')
    //--------------------
    // Convert to string for code
    let stringdata = JSON.stringify({
      full_name: full_name,
      phone_no: phone_no,
      user_id: obj._id
    });

    // Generate QR code properly
    const storagePath = path.join(__dirname, "..", "..", "uploads", "images", "agency", `${phone_no}-qrcode.png`);
    await QRCode.toFile(storagePath, stringdata, {
      errorCorrectionLevel: "L",
      version: 10,
    });

    // Ensure QR Code file exists before reading
    if (!fs.existsSync(storagePath)) {
      throw new Error("QR Code generation failed, file not found.");
    }

    // Read the QR code file as a buffer
    const qrBuffer = fs.readFileSync(storagePath);

    // Upload QR Code to S3
    let awsQrCodeUrl = await AWSUpload.uploadAWSImage({
      file: {
        buffer: qrBuffer,
        originalname: `${phone_no}-qrcode.png`,
        mimetype: "image/png",
      }
    });
    //--------------------
    obj.profile_image = awsQrCodeUrl.image_url


    const data = await obj.save();

    return res.status(201).json({ success: "true", message: message.ADD_DATA("User"), data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: "false", message: error.message });
  }
};

exports.addNEW = async (req, res) => {
  try {
    const { role_id, full_name, email, phone_no, password, profile_image, project_id } = req.body;

    // Check if user already exists
    const isExistingUser = await Users.findOne({ phone_no });
    if (isExistingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Check if project exists (Assuming "Project" model exists)
    if (project_id) {
      // const Project = require("../models/Project"); // Load project model
      const projectExists = await Project.findById(project_id);
      if (!projectExists) {
        return res.status(400).json({ success: false, message: "Project not found" });
      }
    }

    // Generate QR Code
    const qrData = JSON.stringify({ full_name, phone_no });
    const qrCodePath = path.join(__dirname, "..", "..", "uploads", "images", "agency", `${phone_no}-qrcode.png`);
    await QRCode.toFile(qrCodePath, qrData, { errorCorrectionLevel: "L", version: 10 });

    // Upload QR Code to S3
    const awsQrCodeUrl = await AWSUpload.uploadAWSImage({ storagePath: qrCodePath });

    // Upload profile image if provided
    let awsProfileImgUrl = profile_image; // Default to provided URL (if any)
    // if (req.file) {
    awsProfileImgUrl = await AWSUpload.uploadAWSImage({ storagePath: req.file.path });
    // }

    console.log(awsProfileImgUrl, '------------------------------ awsProfileImgUrl')

    // Hash Password (if needed)
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new Users({
      role_id,
      full_name,
      email,
      phone_no,
      password: password,
      profile_image: awsProfileImgUrl,
      project_id,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User added successfully",
      data: savedUser,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update User by ID
exports.updateById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This User") });
    }

    const isExisting = await Users.findOne({
      phone_no: req.body.phone_no,
      _id: { $ne: id },
    });
    if (isExisting) {
      return res.status(400).json({ success: "false", message: message.DATA_EXIST("This Number") });
    }

    const obj = {
      role_id: req.body.role_id,
      full_name: req.body.full_name,
      email: req.body.email,
      profile_image: req.body.profile_image,
    };

    const updatedUser = await Users.findByIdAndUpdate(id, obj, { new: true });
    res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("User"), data: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Delete User by ID
exports.deleteById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This User") });
    }

    await Users.findByIdAndDelete(id);
    res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("User") });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View User by ID
exports.viewById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This user") });
    }

    res.status(200).json({ success: "true", message: message.GET_DATA("User"), data: user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View All Users with Pagination & Search
exports.viewAll = async (req, res) => {
  try {
    const { page = 1, size = 10, s } = req.query;
    const limit = parseInt(size);
    const skip = (page - 1) * limit;

    let query = {};
    if (s) {
      query = { full_name: { $regex: s, $options: "i" } };
    }

    const data = await Users.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip);
    const total = await Users.countDocuments(query);

    res.status(200).json({
      success: "true",
      message: message.GET_DATA("Users"),
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// add keys ----------------------------------------------------
// Add Key with save Qr in local
exports.addKey = async (req, res) => {
  try {
    const { key_name, project_id, key_number, image_url } = req.body;
    const isExistingData = await Users.findOne({ _id: project_id });
    if (!isExistingData) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This Project") });
    }

    const checkDuplicateKeyName = await DoorKey.findOne({ project_id: project_id, key_name: key_name });
    if (checkDuplicateKeyName) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This Key") });
    }

    const checkDuplicateKeyNumber = await DoorKey.findOne({ project_id: project_id, key_number: key_number });
    if (checkDuplicateKeyNumber) {
      return res.status(400).json({ success: false, message: message.DATA_EXIST("This Key") });
    }

    const obj = new DoorKey({
      project_id: project_id,
      key_name: key_name,
      key_number: key_number,
      image_url: image_url,
    });

    const data = await obj.save();

    // Convert to string for code
    let stringdata = JSON.stringify({
      key_name: key_name,
      key_number: key_number,
    });

    // Generate QR code properly
    const storagePath = path.join(__dirname, "..", "..", "uploads", "images", "qrcodes", `${key_name}-qrcode.png`);
    await QRCode.toFile(storagePath, stringdata, {
      errorCorrectionLevel: "L",
      version: 10,
    });

    return res.status(201).json({ success: "true", message: message.ADD_DATA("Key"), data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Update Key by ID
exports.updateKeyById = async (req, res) => {
  try {
    const id = req.params.id;
    const { key_name, project_id, key_number } = req.body;

    const user = await DoorKey.findById(id);
    if (!user) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This key") });
    }

    const isExisting = await DoorKey.findOne({
      project_id: project_id ? project_id : {},
      key_name: key_name ? key_name : {},
      key_number: key_number ? key_number : {},
      _id: { $ne: id },
    });
    if (isExisting) {
      return res.status(400).json({ success: "false", message: message.DATA_EXIST("This key") });
    }

    const obj = {
      project_id: req.body?.project_id,
      key_name: req.body.key_name,
      key_number: req.body.key_number,
      image_url: req.body.image_url,
    };

    const updatedUser = await DoorKey.findByIdAndUpdate(id, obj, { new: true });
    res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Key"), data: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Delete Key by ID
exports.deleteKeyById = async (req, res) => {
  try {
    const id = req.params.id;
    const key = await DoorKey.findById(id);
    if (!key) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This key") });
    }

    await DoorKey.findByIdAndDelete(id);
    res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Key") });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View Key by ID
exports.viewKeyById = async (req, res) => {
  try {
    const id = req.params.id;
    const key = await DoorKey.findById(id).populate("");
    // const key = await DoorKey.aggregate([
    //   {
    //     $match: { _id: id },
    //   },
    //   // {
    //   //   $lookup: {
    //   //     from: "key_assignments",
    //   //     localField: "_id",
    //   //     foreignField: "door_key_id",
    //   //     as: "key_assignments",
    //   //   },
    //   // },
    // ]);
    console.log(key, "----------------------------- key");
    if (!key) {
      return res.status(404).json({ success: "false", message: message.NO_DATA("This key") });
    }

    return res.status(200).json({ success: "true", message: message.GET_DATA("Key"), key });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// View All Key with Pagination & Search
exports.viewAllKeyOfProject = async (req, res) => {
  try {
    const { page = 1, size = 10, s } = req.query;
    const limit = parseInt(size);
    const skip = (page - 1) * limit;
    const { project_id } = req.body; // get user id from token

    let query = {
      project_id: project_id,
    };
    if (s) {
      query = { key_name: { $regex: s, $options: "i" } };
    }

    const data = await DoorKey.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip);
    const total = await DoorKey.countDocuments(query);

    res.status(200).json({
      success: "true",
      message: message.GET_DATA("Users"),
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// assign key --------------------------------------------------
// list of all agency
exports.getAllAgency = async (req, res) => {
  try {
    const { is_occupied, user_id, door_key_id, full_name, phone_no, profile_image } = req.body;
    const role = await Role.findOne({ role: ROLE.AGENCY });
    if (!role) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This Role") });
    }

    const agencies = await Users.find({ role_id: role._id, is_delete: false }).select("_id full_name phone_no profile_image created_at");

    return res.status(201).json({ success: "true", message: message.GET_DATA("Agency data"), agencies });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// Add Key with enerate Qr in local
exports.assignKey = async (req, res) => {
  try {
    const { user_id, door_key_id, agency_employee, project_id = "67d8f87dc4505a139dfd46cf" } = req.body;

    const [key, user] = await Promise.all([DoorKey.findOne({ _id: door_key_id }), Users.findOne({ _id: user_id })]);

    if (!key) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This key") });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: message.NO_DATA("This user") });
    }

    if (key?.is_occupied == true) {
      // const keyOccupiedUserData = await KeyAssignment.findOne({ door_key_id: door_key_id }).select("is_occupied agency_employee").populate("user_id", "full_name phone_no agency_employee");
      const keyOccupiedUserData = await KeyAssignment.find({ door_key_id: door_key_id }).select("user_id agency_employee").populate("user_id", "full_name phone_no agency_employee");
      return res.status(400).json({ success: false, message: message.OCCUPIED("This key"), keyOccupiedUserData });
    }

    const obj = new KeyAssignment({
      project_id: project_id,
      user_id: user_id,
      door_key_id: door_key_id,
      agency_employee: {
        full_name: agency_employee.full_name,
        phone_no: agency_employee.phone_no,
        profile_image: agency_employee.profile_image,
      },
    });

    const data = await obj.save();
    await DoorKey.findOneAndUpdate({ _id: door_key_id }, { is_occupied: true });
    return res.status(201).json({ success: "true", message: message.ADD_DATA("Key Assign"), data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};

// view all occupied key
exports.getAllOccupiedKey = async (req, res) => {
  try {
    const project_id = "67d8f87dc4505a139dfd46cf"; // get from token
    const occupiedKey = await DoorKey.find({ is_occupied: true, project_id: project_id, is_delete: false }).select("_id key_name key_number is_occupied");

    return res.status(201).json({ success: "true", message: message.GET_DATA("Occupied key data"), occupiedKey });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: "false", message: error.message });
  }
};
