const mongoose = require('mongoose');

module.exports = (router, repository) => {

  // Retorna todos os livros de um autor
  router.get('/author/:id', (req, res, next) => {
    const mongoose = require('mongoose');

    // Verifica se o ID é valido
    if (!mongoose.isValidObjectId(req.params.id)){
      return res.sendStatus(400);
    }
    
    repository.getBooksByAuthorID(req.params.id, (err, books) => {
      if (err) { return next(err); }

      if (books){
        res.status(201).json(books);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });

  // Insere um livro no banco de dados
  router.post('/create', (req, res, next) => {
    const newBook = {
      title: req.body.title,
      poster_path: req.body.poster_path,
      authors: req.body.authors,
      genre: req.body.genre,
      summary: req.body.summary,
      type: req.body.type,
    };
    
    repository.insertBook(newBook, (err, book) => {
      if (!err && book){
        res.status(201).json(book);
      }
      else{
        res.sendStatus(409);
      }
      repository.disconnect();
    });
  });

  // Pesquisa livros
  router.get('/:type?/find/(:searchName)?/:page?', (req, res, next) => {

    const page = parseInt(req.params.page) || 1;
    const type = req.params.type === 'ebook' ? 'ebook' : 'printed';
    const param = req.params.searchName || "";

    repository.findBook(type, param, page, (err, books) => {
      if (err) { return next(err); }

      if (books){
        res.status(201).json(books[0]);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });

  // Retorna o um livro pelo ID
  router.get('/:id', (req, res, next) => {
    const mongoose = require('mongoose');

    // Verifica se o ID é valido
    if (!mongoose.isValidObjectId(req.params.id)){
      return res.sendStatus(400);
    }

    repository.getBook(req.params.id, (err, book) => {
      if (err) { return next(err); }

      if (book){
        res.status(201).json(book);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });
}
