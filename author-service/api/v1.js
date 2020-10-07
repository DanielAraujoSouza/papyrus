const { ObjectId } = require("mongodb");

module.exports = (router, repository) => {

  // Insere um autor no banco de dados
  router.post('/create', (req, res, next) => {
    const newAuthor = {
      name: req.body.name,
      poster_path: req.body.poster_path,
      date_of_birth: new Date(`${req.body.date_of_birth} 00:00:00`),
      date_of_death: req.body.date_of_death ? new Date(`${req.body.date_of_birth} 00:00:00`) : "",
      description: req.body.description,
    };
    
    repository.insertAuthor(newAuthor, (err, author) => {
      if (!err && author){
        res.status(201).json(author);
      }
      else {
        res.sendStatus(409);
      }
      repository.disconnect();
    });
  });

  // Pesquisa autores
  router.get('/find/(:searchName)?/:page?', (req, res, next) => {

    const page = parseInt(req.params.page) || 1;
    const param = req.params.searchName || "";

    repository.findAuthor(param, page, (err, authors) => {
      if (err) { return next(err); }

      if (authors){
        res.status(201).json(authors[0]);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });
  
  // Insere um comentario em um autor
  router.put('/:authorID/commentary', (req, res, next) => {
    const newComment = {
      _id: ObjectId(),
      user: req.body.user,
      comment_text:  req.body.comment_text,
      date: Date.now()
    };
    console.log(newComment)
    repository.insertAuthorCommentary(req.params.authorID, newComment, (err, author) => {
      if (!err && author){
        res.status(201).json(newComment);
      }
      else{
        console.log(err)
        res.sendStatus(400);
      }
      repository.disconnect();
    });
  });

  // Retorna um comentario de um autor
  router.get('/:authorID/commentary/:commentID', (req, res, next) => {
    if (!ObjectId.isValid(req.params.commentID) || !ObjectId.isValid(req.params.authorID)){
      res.sendStatus(400);
    }
    else {
      repository.getCommentaryById(req.params.authorID, req.params.commentID, (err, infos) => {
        if (!err && infos){
          console.log('commentary')
          console.log(infos)
          res.status(201).json(infos.commentaries[0]);
        }
        else{
          console.log(err)
          res.sendStatus(400);
        }
        repository.disconnect();
      });
    }
  });

  // Remove um comentario de um autor
  router.delete('/:authorID/commentary/:commentID', (req, res, next) => {
    if (!ObjectId.isValid(req.params.commentID) || !ObjectId.isValid(req.params.authorID)){
      res.sendStatus(400);
    }
    else {
      repository.removeCommentaryById(req.params.authorID, req.params.commentID, (err, infos) => {
        if (!err && infos){
          console.log('commentary')
          console.log(infos)
          res.status(201).json(infos);
        }
        else {
          console.log(err)
          res.sendStatus(400);
        }
        repository.disconnect();
      });
    }
  });
  
  // Retorna o um autor pelo ID
  router.get('/:id', (req, res, next) => {
    const mongoose = require('mongoose');

    // Verifica se o ID é valido
    if (!mongoose.isValidObjectId(req.params.id)){
      return res.sendStatus(400);
    }

    repository.getAuthor(req.params.id, (err, author) => {
      if (err) { return next(err); }

      if (author){
        res.status(201).json(author);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });

  // Retona todos os autores
  router.get('/', (req, res, next) => {
    repository.getAuthors((err, authors) => {
      if (err) { return next(err); }

      if (authors){
        res.status(201).json(authors);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });
}
