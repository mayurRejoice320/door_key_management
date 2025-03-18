const multer = require("multer");
// const db = require('../../app/models')

// const methods = {
//     create: async (model, data, additional = undefined) => {
//         return model.create(data, additional || undefined)
//     },
//     update: async (model, query, data, additional = undefined) => {
//         return model.update(data, query, additional || undefined)
//     },
//     delete: async (model, query, additional = undefined) => {
//         return model.destroy(query, additional || undefined)
//     },
//     get: async (model, query, additional = undefined) => {
//         return model.findOne(query, additional || undefined)
//     },
//     getAll: async (model, query) => {
//         return model.findAll({ ...query })
//     },
//     getAndCountAll: async (model, query, limit, offset) => {
//         return model.findAndCountAll({ ...query, limit, offset })
//     },
//     getPagination: (page, size) => {
//         const limit = size ? +size : 10;
//         const offset = page ? page * limit : 0;
//         return { limit, offset };
//     },
//     getPagingData: (alldata, page, limit) => {
//         const { count: totalItems, rows: data } = alldata;
//         const currentPage = page ? +page : 0;
//         const totalPages = Math.ceil(totalItems / limit);
//         return { totalItems, data, totalPages, currentPage };
//     }

// }

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
// AWS S3 Client Setup
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  

// module.exports = { methods }

const imageStorage = multer.diskStorage({
    // Destination to store image
    destination: "uploads/images/product",
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
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

    get: async (model, query) => {
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
    }
};

module.exports = { methods };
