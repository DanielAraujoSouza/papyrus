const express = require('express');
const router = express.Router();
const { adapterGet } = require(`${__dirname}/../adapter`);
const {
  authenticated,
  unauthenticated,
  adminArea,
} = require(`${__dirname}/../authentication/middlewares`);

// Página inicial da web ui
router.get(['/', '/home'], async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => { 
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Página de busca
router.get('/search/:page?', async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.url}`, req.user, res, (res, resp) => { 
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Página de cadastro
router.get('/registration', unauthenticated, async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => {
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Página de inserção de livro
router.get(/.(book|ebook|author)\/insert$/, adminArea, async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => {
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Página de visualização de livro
router.get(["/book/:id", "/ebook/:id"], async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => {
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Página de visualização de autor
router.get("/author/:id", async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => {
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Página de favoritos
router.get("/user/favorites/:page?", authenticated, async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => {
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Página do usuario
router.get("/user/profile", authenticated, async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => {
    res.header(resp.headers);
    res.send(resp.data);
  });
});

// Direciona para a rota estática
router.get(/.(images|stylesheets|javascripts)*.(svg|png|js|css)/, async (req, res) => {
  adapterGet(`${process.env.WEB_UI_SERVICE}${req.path}`, req.user, res, (res, resp) => { 
    res.header(resp.headers);
    res.send(resp.data);
  });
});

module.exports = router;
