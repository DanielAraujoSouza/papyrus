const axios = require('axios');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const adapter = require('../adapter');
const { adapterPost, adapterPut, adapterDelete } = require(`${__dirname}/../adapter`);
const { 
  authenticated,
  unauthenticated,
  adminArea
} = require(`${__dirname}/../authentication/middlewares`);
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

// Requisição de inclusão de conteudo
router.post("/insert", adminArea, upload, async (req, res, next) => {
  // Objeto que armazena as mensagens de erro
  let erros = {};

  // Verifica se o título é válido
  if (req.body.title === undefined || req.body.title.length < 4) {
    erros.title = "Nome deve conter pelo menos 4 caractéres!";
  }

  // Verifica se o gênero é válido
  let genreArray = [];
  if (req.body.genre === undefined) {
    erros.genre = "Gênero deve conter pelo menos 4 caractéres!";
    
  }
  else {
    genreArray = req.body.genre.split(",");
    genreArray.forEach(genre => {
      if (genre.length < 4){
        erros.genre = "Gênero deve conter pelo menos 4 caractéres!";
      }
    });
  }

  // Verifica se o autor é válido
  let bookAuthors = [];
  if (req.body.author === undefined || req.body.author.length < 1) {
    erros.author = "Escolha ao menos um autor!";
  }
  else {
    // Busca os autores inseridos na plataforma
    const authors = await axios.get(`${process.env.AUTHOR_SERVICE}`).then(resp => {
      return resp.data;
    })
    .catch(err => {
      return [];
    });

    // Verifica se ID do autor é válido
    if (typeof(req.body.author) === 'string'){
      const author = authors.find(a => a._id === req.body.author);
      if (author !== undefined) {
        bookAuthors.push({
          _id: author._id,
          name: author.name,
        });
      }
    }
    else {
      req.body.author.forEach(authorId => {
        const author = authors.find(a => a._id === authorId);
        if (author !== undefined) {
          bookAuthors.push({
            _id: author._id,
            name: author.name,
          });
        }
      });
    }

    if (!bookAuthors.length) {
      erros.author = "Escolha ao menos um autor!";
    }
  }

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
      title: req.body.title,
      poster_path: req.file ? req.file.path : "",
      authors: bookAuthors,
      genre: genreArray,
      summary: req.body.description,
      type: "printed",
    };
    adapterPost(`${process.env.BOOK_SERVICE}/create`, req.user, res, data, (res, resp) => {
      res.header(resp.headers);
      res.send(resp.data);
    });
  }
});

// Requisição de inclusão de comentário
router.put("/:bookId/commentary", authenticated, async (req, res, next) => {

  let erros = {};
  console.log(req.body)
  // Verifica se o conteudo é válido
  if (req.body.comment_text === undefined || req.body.comment_text.length < 4) {
    erros.comment_text = "O comentário deve conter pelo menos 4 caractéres!";
  }
  if (Object.keys(erros).length) {
    // Envia os erros
    res.status(400).json({ erros: erros });
  } else {
    const data = {
      user: {
        _id: req.user._id,
        name: req.user.name,
        avatar_path: req.user.avatar_path || "",
      },
      comment_text: req.body.comment_text,
    }
    const url = `${process.env.BOOK_SERVICE}/${req.params.bookId}/commentary`;
    adapterPut(url, req.user, res, data, (res, resp) => {
      console.log('resp.data')
      console.log(resp.data)
      res.header(resp.headers);
      res.send(resp.data);
    });
  }
});

// Requisição de remoção de comentário
router.delete("/:bookId/commentary/:commentID", authenticated, async (req, res, next) => {

  const url = `${process.env.BOOK_SERVICE}/${req.params.bookId}/commentary/${req.params.commentID}`;
  function callback(res, resp) {
    console.log('resp.delete')
    console.log(resp.data)
    res.header(resp.headers);
    res.send(resp.data);
  };

  console.log(req.user)
  if (req.user.role === "ADMIN") {
    adapterDelete(url, req.user, res, callback);
  }
  else {
    axios.get(url)
    .then(resp => {
      if(req.user._id === resp.user._id){
        adapterDelete(url, req.user, res, callback);
      }
      else {
        res.sendStatus(401);
      }
    })
    .catch(err => {
      res.sendStatus(502);
    });
  }
});

module.exports = router;