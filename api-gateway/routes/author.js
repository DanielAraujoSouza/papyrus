const axios = require('axios');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Define a estrategia de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage }).single('poster');

const { adapterPost } = require(`${__dirname}/../adapter`);

const { adminArea } = require(`${__dirname}/../authentication/middlewares`);

// Requisição de inclusão de conteudo
router.post("/insert", adminArea, upload, async (req, res, next) => {
  // Objeto que armazena as mensagens de erro
  let erros = {};

  // Verifica se o título é válido
  if (req.body.title === undefined || req.body.title.length < 4) {
    erros.title = "Nome deve conter pelo menos 4 caractéres!";
  }

  // Verifica se as datas são válidas
  const dateRegexp = new RegExp("^[1-9][0-9]{3}-0[1-9]|1[0-2]-0[1-9]|[1-2][0-9]|3[0-1]$");
  if (req.body.date_of_birth === undefined || !dateRegexp.test(req.body.date_of_birth)) {
    erros.date_of_birth = "Data inválida!";
  }

  if (req.body.date_of_death !== undefined && req.body.date_of_death && !dateRegexp.test(req.body.date_of_death)) {
    erros.date_of_death = "Data inválida!";
  }

  // Verifica se é uma imagem válida são válidas
  if(req.file !== undefined) {
    const mimeTest = new RegExp("^image/");
    if (!mimeTest.test(req.file.mimetype)){
      erros.poster = "Imagem inválida!";
    }
  }

  // Verifica se a descrição é válida
  if (req.body.description === undefined || req.body.description < 20) {
    erros.description = "Descrição deve conter pelo menos 20 caractéres!";
  }

  if (Object.keys(erros).length) {
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) {
          return
        }
      });
    }
    
    // Envia os erros
    res.status(400).json({ erros: erros });
  } else {
    const data = {
      name: req.body.title,
      poster_path: req.file ? req.file.path : "",
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death || "",
      description: req.body.description,
    };
    adapterPost(`${process.env.AUTHOR_SERVICE}/create`, req.user, res, data, (res, resp) => {
      res.header(resp.headers);
      res.send(resp.data);
    });
  }
});

module.exports = router;