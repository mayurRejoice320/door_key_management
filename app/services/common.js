const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// AWS S3 Client Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "uploads/images/product",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});

const methods = {
  imageUpload: multer({
    storage: imageStorage,
    limits: {
      fileSize: 2000000, // 1000000 Bytes = 2 MB
    },
    fileFilter(req, file, cb, next) {
      if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
        // upload only png and jpg format
        return cb(new Error("Please upload a Image"));
      }
      cb(undefined, true);
    },
  }),

  create: async (model, data) => {
    return await model.create(data);
  },

  update: async (model, query, data) => {
    return await model.findOneAndUpdate(query, data, { new: true });
  },

  delete: async (model, query) => {
    return await model.findOneAndDelete(query);
  },

  findOne: async (model, query) => {
    return await model.findOne(query);
  },

  getAll: async (model, query) => {
    return await model.find(query);
  },

  getAndCountAll: async (model, query, limit, offset) => {
    const data = await model.find(query).limit(limit).skip(offset);
    const totalItems = await model.countDocuments(query);
    return { totalItems, data };
  },

  getPagination: (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
  },

  getPagingData: (alldata, page, limit) => {
    const { totalItems, data } = alldata;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, data, totalPages, currentPage };
  },
  hashPassword: async ({ password }) => {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  },

  generateToken: (data) => {
    const token = jwt.sign(data, process.env.JWT_SECRET /* { expiresIn: process.env.JWT_EXPIRES_IN } */);
    return token;
  },

  decodeToken: ({ token }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return "token_expire";
      } else {
        return "invalid_token";
      }
    }
  },
  comparePassword: async ({ password, hashPwd }) => {
    console.log(password, hashPwd, "-------- compare");
    if (!password || !hashPwd) {
      return false;
    }
    const isPasswordMatch = await bcrypt.compare(password, hashPwd);
    return isPasswordMatch;
  },
};

module.exports = { methods };
