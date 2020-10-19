
// Define a estrategia de armazenamento
require('dotenv');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();

const uploadStrategy = multer({
  storage: inMemoryStorage,
  fileFilter: function (req, file, cb) {
    if (RegExp('^image/(gif|png|jpeg|bmp|webp)$').test(file.mimetype)) {
      return cb(null, true);
    }
    cb(null, false);
  }
}).single('avatar');

function azureUpload (file) {
  console.log('upload')
  const azureStorage = require('azure-storage');
  const blobService = azureStorage.createBlobService();
  const getStream = require('into-stream');

  const blobName = file.blobName;
  const stream = getStream(file.buffer);
  const streamLength = file.buffer.length;
  const containerName = file.containerName;
  console.log(containerName)

  blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
    console.log(err);
  });
}

module.exports = {
  uploadStrategy,
  azureUpload
};
