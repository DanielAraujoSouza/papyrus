const passport = require('passport');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { adapterGet, adapterPost, adapterPut, adapterDelete } = require(`${__dirname}/../adapter`);
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
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (RegExp('^image/(gif|png|jpeg|bmp|webp)$').test(file.mimetype)) {
      return cb(null, true);
    }
    cb(null, false);
  }
}).single('avatar');

// Solicitação para login
router.post("/sigin", unauthenticated, (req, res, next) => {

  passport.authenticate("local", function (err, user) {
    if (err) {
      return next(err);
    }
    // E-mail ou senha incorretos
    if (!user) {
      return res
        .status(401)
        .json({ status: "erro", message: "E-mail ou senha incorretos" });
    }
    // Cria a sessão
    req.login(user, function (err) {
      console.log('osk')
      if (err) {
        return next(err);
      }
      return res.json({ status: "ok" });
    });
  })(req, res, next);
});

// Solicitação para deslogar
router.get("/sigout", authenticated, (req, res, next) => {
  req.logout();
  res.redirect("/");
});

// Solicitação para atualizar usuário.
router.put("/profile", authenticated, upload, async (req, res, next) => {
  // Objeto que armazena as mensagens de erro
  let erros = {};

  // Verifica se o nome é válido
  if (req.body.name === undefined || req.body.name.length < 4) {
    erros.name = "Nome deve conter pelo menos 4 caractéres!";
  }

  if(
      (req.body.password !== undefined && req.body.password)
      || (req.body.password_confirmation !== undefined && req.body.password_confirmation)
    ) {
    // Verifica se o password é válido
    const passwordRegexp = new RegExp("^[-!#$@%&'*+/0-9=?A-Z^_`a-z{|}~()]{8,}$");
    if ( !passwordRegexp.test(req.body.password) ) {
      erros.password = "A senha deve conter pelo menos 8 caractéres sem espaçamento!";
    }

    // Verifica se a confirmação de senha é válida
    if ( req.body.password !== req.body.password_confirmation ) {
      erros.password_confirmation = "As senhas não são iguais!";
    }
  }
  
  // Verifica se o email válido
  const emailRegexp = new RegExp(
    "^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$"
  );
  if (req.body.email === undefined || !emailRegexp.test(req.body.email)) {
    erros.email = "Endereço de e-mail inválido!";
  }
  else if (req.body.email !== req.user.email){
    const axios = require('axios');
    const emailResp = await axios.get(`${process.env.USER_SERVICE}/${req.body.email}/available`);
    if (emailResp.data.available !== undefined &&  emailResp.data.available === "false") {
      console.log(emailResp.data)
      erros.email = "Email j cadastrado";
    }
    
  } 
  
  if (Object.keys(erros).length) {
    // Renderiza página se houver erros
    console.log(erros)
    res.status(400).json({ erros: erros });
  } else {
    
    const data = {};
    // Verifica se o nome passado difere do atual
    if (req.body.name !== req.user.name) {
      data.name = req.body.name
    }

    // Verifica se o email passado difere do atual
    if (req.body.email !== req.user.email) {
      data.email = req.body.email
    }

    // Verifica se foi enviada uma nova imagem ou para remover
    if (req.file && req.file.path) {
      data.avatar_path = req.file.path;
    }
    else if (req.body.remove_img !== undefined && req.body.remove_img) {
      data.avatar_path = "";
    }

    // Verifica se uma nova senha foi enviada
    if (req.body.password !== undefined && req.body.password) {
      data.password = req.body.password;
    }

    // Se houver modificação envia ao serviço
    if (Object.keys(data).length) {
      adapterPut(`${process.env.USER_SERVICE}/${req.user._id}`, req.user, res, data, (res, resp) => {
        res.header(resp.headers);
        console.log(resp.data)
        res.send(resp.data);
      });
    }
    else {
      res.sendStatus(304);
    }
  } 
});


// Solicitação para registrar usuário.
router.post("/registration", unauthenticated, async (req, res, next) => {
  // Objeto que armazena as mensagens de erro
  let erros = {};

  // Verifica se o nome é válido
  if (req.body.name === undefined || req.body.name.length < 4) {
    erros.name = "Nome deve conter pelo menos 4 caractéres!";
  }

  // Verifica se o password é válido
  const passwordRegexp = new RegExp("^[-!#$@%&'*+/0-9=?A-Z^_`a-z{|}~()]{8,}$");
  if (
    req.body.userPassword === undefined ||
    !passwordRegexp.test(req.body.userPassword)
  ) {
    erros.password =
      "A senha deve conter pelo menos 8 caractéres sem espaçamento!";
  }

  // Verifica se a confirmação de senha é válida
  if (
    req.body.password_confirm === undefined ||
    req.body.userPassword !== req.body.password_confirm
  ) {
    erros.password_confirm = "As senhas não são iguais!";
  }

  // Verifica se o email válido
  const emailRegexp = new RegExp(
    "^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$"
  );
  if (req.body.userEmail === undefined || !emailRegexp.test(req.body.userEmail)) {
    erros.email = "Endereço de e-mail inválido!";
  } else {

    adapterGet(`${process.env.USER_SERVICE}/${req.body.userEmail}/available`, 
    req.user, res, (res, resp) => {
      if (Object.keys(erros).length) {
        // Renderiza página se houver erros
        res.status(400).json({ erros: erros });
      } else {
        adapterPost(`${process.env.USER_SERVICE}/create`, req.user, res, {
          name: req.body.name,
          email: req.body.userEmail,
          password: req.body.userPassword,
          role: "USER",
        }, (res, resp) => {
          // Realiza login após cadastro
          req.login(resp.data, err => {
            res.header(resp.headers);
            res.send(resp.data);
          });
        });
      } 
    });     
  } 
});

// Verfica se o e-mail ja existe
router.get("/:email/available", (req, res, next) => {
  adapterGet(`${process.env.USER_SERVICE}${req.path}`, req.user, res, (res, resp) => {
    res.header(resp.headers);
    res.send(resp.data);
  });
});

module.exports = router;