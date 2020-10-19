require('dotenv');
const { BlobServiceClient } = require('@azure/storage-blob');

// Define a estrategia de armazenamento
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
});

async function fileUpload (file) {
  const getStream = require('into-stream');
  const { BlobServiceClient } = require('@azure/storage-blob');
  // Crie o objeto BlobServiceClient que será usado para criar um cliente de contêiner
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  // Obtem uma referência para o contêiner que armazena os upload
  const containerClient = blobServiceClient.getContainerClient(file.containerName);
  // Cria o contêiner se ele não existir
  await containerClient.createIfNotExists({access: "blob"});
  // Obtem uma referência para bloco BLob
  const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);

  const fileStream = getStream(file.buffer);
  const sharp = require('sharp')
  const transformer = sharp()
  .resize({
    width: 200
  });
  const resizedFileStream = fileStream.pipe(transformer);

  // Realiza o upload do Buffer armazenado na memoria
  const uploadBlobResponse = await blockBlobClient.uploadStream(resizedFileStream, file.buffer.length);
}

async function fileDelete(url) {

  const fileURL = new URL(url);
  const filePath = fileURL.pathname.split('/');
  const containerName = filePath[1];
  const blobName = filePath[2];

  // Crie o objeto BlobServiceClient que será usado para criar um cliente de contêiner
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

  // Obtem uma referência para o contêiner que armazena os upload
  const containerClient = blobServiceClient.getContainerClient(containerName);
  // Obtem uma referência para bloco BLob
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  // Realiza o upload do Buffer armazenado na memoria
  const deleteBlobResponse = await blockBlobClient.deleteIfExists();
}

module.exports = {
  uploadStrategy,
  fileUpload,
  fileDelete
};
