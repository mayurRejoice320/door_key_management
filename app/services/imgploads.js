// var fs = require('fs');
// var AWS = require('aws-sdk');
// const multer = require('multer');


// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// const upload = multer({ storage: storage, fileFilter: fileFilter });

// const uploadAWSImage = async (data) => {
//     const s3 = new AWS.S3({
//         accessKeyId: process.env.AWS_ACCESSKEY_ID,
//         secretAccessKey: process.env.SECRETACCESSKEY
//     });

//     const file = data.file;
//     console.log(file,'----------------------------------------------------');

//     const params = {
//         Bucket: process.env.BUCKET,
//         Key: 'demo12.jpeg',
//         Body: file.buffer,
//         ContentType: file.mimetype
//     };

//     try {
//         const data = await s3.upload(params).promise();
//         const response = { image_url: data.Location }
//         return response

//     } catch (error) {
//         console.error(error);
//         throw error
//     }
// }

// module.exports = {
//     upload,
//     uploadAWSImage,
// }



const AWS = require('aws-sdk');
const multer = require('multer');

// Multer Storage (Using MemoryStorage to access buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG images are allowed'), false);
        }
    }
});

const uploadAWSImage = async ({ file }) => {
    if (!file || !file.buffer) {
        console.error("Upload Error: File or buffer is missing", file); // Debugging log
        throw new Error("Invalid file data: 'file.buffer' is required for upload.");
    }

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESSKEY_ID,
        secretAccessKey: process.env.SECRETACCESSKEY
    });

    const params = {
        Bucket: process.env.BUCKET,
        Key: `images/${file.originalname}`, // Unique filename
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        return { image_url: uploadResult.Location };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw error;
    }
}

module.exports = {
    upload,
    uploadAWSImage,
};
