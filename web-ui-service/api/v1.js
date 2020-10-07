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

    const searchName = req.query.q || '';
    const searchParams = `?type=${searchType}`
    .concat(searchName && `&q=${searchName}`);

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

  // Formulario de inserção.
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

  router.get('/author/insert', async (req, res) => {

    res.render("contentInsert", {
      title: "Adicionar Autor",
      user: req.user,
      contentType: "autor",
      authors: null,
    });
  });

  // Pagina de visualização de livro
  router.get(["/book/:id", "/ebook/:id"], async (req, res) => {
    const bookGet = axios.get(`${process.env.BOOK_SERVICE}/${req.params.id}`);
    const favoriteGet = axios.get(`${process.env.USER_SERVICE}/${req.user._id}/favorites/${req.params.id}`);

    Promise.all([bookGet, favoriteGet])
    .then((results) => {
      const bookInfo = results[0].data;
      req.user.favorites = results[1].data;
      
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

      console.log(bookInfo)

      res.render("bookDetail", {
        user: req.user,
        ...bookInfo
      });
    });
  });

  // Página de visualização de autor
  router.get("/author/:id", async (req, res) => {
    const axios = require('axios');

    const authorData = axios.get(`${process.env.AUTHOR_SERVICE}/${req.params.id}`);
    const Books = axios.get(`${process.env.BOOK_SERVICE}/author/${req.params.id}`);

    Promise.all([authorData, Books])
    .then(results => {
      const author = results[0].data;
      const books = results[1].data;

      if (author.date_of_birth){
        author.date_of_birth = new Date(author.date_of_birth)
        .toLocaleDateString('pt-BR', { day: "2-digit", month: "2-digit", year: "numeric" });
        author.date_of_birth = `${author.date_of_birth.split("-")[2]}-${author.date_of_birth.split("-")[1]}-${author.date_of_birth.split("-")[0]}`;
      }

      if (author.date_of_death){
        author.date_of_death = new Date(author.date_of_death)
        .toLocaleDateString('pt-BR', { day: "2-digit", month: "2-digit", year: "numeric" });
        author.date_of_death = `${author.date_of_death.split("-")[2]}-${author.date_of_death.split("-")[1]}-${author.date_of_death.split("-")[0]}`;
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