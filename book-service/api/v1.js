const { ObjectId } = require('mongodb');
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
        res.status(200).json(books);
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
        console.log(err)
        res.sendStatus(500);
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
        res.status(200).json(books[0]);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });

  // Insere um comentario em um livro
  router.put('/:bookID/commentary', (req, res, next) => {
    const newComment = {
      _id: ObjectId(),
      user: req.body.user,
      comment_text:  req.body.comment_text,
      date: Date.now()
    };
    console.log(newComment)
    repository.insertBookCommentary(req.params.bookID, newComment, (err, book) => {
      if (!err && book){
        res.status(200).json(newComment);
      }
      else{
        console.log(err)
        res.sendStatus(400);
      }
      repository.disconnect();
    });
  });

  // Retorna um comentario de um livro
  router.get('/:bookID/commentary/:commentID', (req, res, next) => {
    if (!ObjectId.isValid(req.params.commentID) || !ObjectId.isValid(req.params.bookID)){
      res.sendStatus(400);
    }
    else {
      repository.getCommentaryById(req.params.bookID, req.params.commentID, (err, infos) => {
        if (!err && infos){
          console.log('commentary')
          console.log(infos)
          res.status(200).json(infos.commentaries[0]);
        }
        else{
          console.log(err)
          res.sendStatus(400);
        }
        repository.disconnect();
      });
    }
  });

  // Remove um comentario de um livro
  router.delete('/:bookID/commentary/:commentID', (req, res, next) => {
    if (!ObjectId.isValid(req.params.commentID) || !ObjectId.isValid(req.params.bookID)){
      res.sendStatus(400);
    }
    else {
      repository.removeCommentaryById(req.params.bookID, req.params.commentID, (err, infos) => {
        if (!err && infos){
          console.log('commentary')
          console.log(infos)
          res.status(200).json(infos);
        }
        else {
          console.log(err)
          res.sendStatus(400);
        }
        repository.disconnect();
      });
    }
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

  // Atualiza insformações dos usuarios dos comentarios
  router.put('/commentaries/user/:userID', (req, res, next) => {
    const userInfo = {};

    if (req.body.name !== undefined) {
      userInfo.name = req.body.name
    }

    if (req.body.avatar_path !== undefined) {
      userInfo.avatar_path = req.body.avatar_path;
    }

    if (!ObjectId.isValid(req.params.userID)) {
      res.sendStatus(404);
    }
    else if (!Object.keys(userInfo)){
      res.sendStatus(304);
    }
    else {
      repository.updateUserCommentary(req.params.userID, userInfo, (err, result) => {
        if (!err && result){
          res.status(200).json(result);
        }
        else{
          console.log(err)
          res.sendStatus(400);
        }
        repository.disconnect();
      });
    }
  });
}
