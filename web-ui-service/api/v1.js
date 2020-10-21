const { adapterGet } = require('../adapter');
const axios = require('axios');
module.exports = (router) => {
  
  // Página inicial
  router.get(['/', '/home'], (req, res, next) => {
    res.render("home", {
      title: "Home",
      user: req.user
    });
  });

  // Página de cadastro
  router.get('/registration', (req, res) => {
    res.render("registration", {
      title: "Cadastro",
      user: req.user,
      erros: {},
      inputs: {},
    });
  });

  // Solicitação para a página de busca.
  router.get('/search/:page?', async (req, res) => {
    
    const page = !parseInt(req.params.page) ? 1 : parseInt(req.params.page);
    
    let searchType = "book";
    if (req.query.type === "ebook") {
      searchType = "ebook";
    }
    else if (req.query.type === "author") {
      searchType = "author";
    }

    let searchName = req.query.q || '';
    searchName = String(searchName).replace(/\//g,"");

    const url = `${process.env.SEARCH_SERVICE}/${searchType}/${searchName}`;
    adapterGet(url, res, (res, resp) => {
      const results = resp.data;
      res.render("titlesList", {
        title: "Busca",
        user: req.user,
        currentPage: page,
        searchQuery: searchName,
        contentType: searchType,
        paginationPath: "/search/",
        ...results,
      });
    });
  });

  // Formulario de inserção de livro.
  router.get('/book/insert', async (req, res) => {

    adapterGet(process.env.AUTHOR_SERVICE, res, (res, resp) => {
      res.render("contentInsert", {
        title: "Adicionar Livro",
        user: req.user,
        contentType: "livro",
        authors: resp.data
      });
    });
  });

  // Formulario de inserção de ebook.
  router.get('/ebook/insert', async (req, res) => {

    adapterGet(process.env.AUTHOR_SERVICE, res, (res, resp) => {
      res.render("contentInsert", {
        title: "Adicionar eBook",
        user: req.user,
        contentType: "ebook",
        authors: resp.data
      });
    });
  });

  // Pagina de visualização de livro
  router.get(["/book/:id", "/ebook/:id"], async (req, res) => {

    const bookGet = axios.get(`${process.env.BOOK_SERVICE}/${req.params.id}`);
    const userID = req.user ? req.user._id : "";
    let favoriteGet = null;
    if (userID) {
      favoriteGet = axios.get(`${process.env.USER_SERVICE}/${userID}/favorites/${req.params.id}`);
    }
  
    let bookInfo = {};
    await bookGet.then(resp => {
      bookInfo = resp.data
    })
    .catch(err => {
      console.log(err)
    });

    if (favoriteGet) {
      await favoriteGet.then(resp => {
        req.user.favorites = resp.data || null;
      })
      .catch(err => {
        console.log(err)
      });
    }

    // Ordena os comentarios
    bookInfo.commentaries = bookInfo.commentaries.sort(function (a, b) {
      if (a.date > b.date) {
        return -1;
      }
      else if (a.date < b.date) {
        return 1;
      }
      else {
        return 0;
      }
    });

    res.render("bookDetail", {
      user: req.user,
      ...bookInfo
    });
  });
  
  // Formulario de inserção de autor
  router.get('/author/insert', async (req, res) => {

    res.render("contentInsert", {
      title: "Adicionar Autor",
      user: req.user,
      contentType: "autor",
      authors: null,
    });
  });

  // Página de visualização de visualização de perfil
  router.get("/author/:id", async (req, res) => {
    const axios = require('axios');

    const authorData = axios.get(`${process.env.AUTHOR_SERVICE}/${req.params.id}`);
    const authorBooks = axios.get(`${process.env.BOOK_SERVICE}/author/${req.params.id}`);

    Promise.allSettled([authorData, authorBooks])
    .then(results => {
      let author = {};
      if (results[0].status === "fulfilled") {
        author = results[0].value.data;
      }
      else {
        return res.sendStatus(404);
      }
      
      let books = results[1].status === "fulfilled" ? results[1].value.data : null;

      if (author.date_of_birth){
        const dt = new Date(author.date_of_birth)
        const day = dt.getDate();
        const month = dt.getMonth() + 1;
        const year = dt.getFullYear();
        author.date_of_birth = `${day < 10 ? `0${day}` : day}-${month < 10 ? `0${month}` : month}-${year}`;
      }

      if (author.date_of_death){
        const dt = new Date(author.date_of_death)
        const day = dt.getDate();
        const month = dt.getMonth() + 1;
        const year = dt.getFullYear();
        author.date_of_death = `${day < 10 ? `0${day}` : day}-${month < 10 ? `0${month}` : month}-${year}`;
      }

      res.render("authorDetail", {
        title: author.name,
        user: req.user,
        contentType: "Autor",
        books,
        ...author
      });
    })
    .catch((e) => {
      res.sendStatus(502);
    });
  });

  // Solicitação para a página de favoritos.
  router.get('/user/profile', async (req, res) => {

    res.render("userProfile", {
      title: "Editar Perfil",
      user: req.user
    });
  });
  
  // Solicitação para a página de favoritos.
  router.get('/user/favorites/:page?', async (req, res) => {
    const page = !parseInt(req.params.page) ? 1 : parseInt(req.params.page);

    const url = `${process.env.USER_SERVICE}/${req.user._id}/favorites/page/${page}`;
    adapterGet(url, res, (res, resp) => {
      const results = resp.data;
      res.render("favorites", {
        title: "Favoritos",
        user: req.user,
        currentPage: page,
        ...results,
      });
    });
  });
}