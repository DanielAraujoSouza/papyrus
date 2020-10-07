const { json } = require('body-parser');
const express = require('express');
const router = express.Router();
const passport = require("passport");
const { adapterGet, adapterPost } = require(`${__dirname}/../adapter`);
const {
  authenticated,
  unauthenticated,
  adminArea
} = require(`${__dirname}/../authentication/middlewares`);

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