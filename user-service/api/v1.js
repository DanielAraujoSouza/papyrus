const { ObjectId } = require('mongodb');
const { adapterGet } = require('../adapter');

module.exports = (router, repository) => {
  // Retorna Lista de usuários
  router.get('/', (req, res, next) => {
    repository.getAllUsers((err, users) => {
      if(err) return next(err);
      repository.disconnect();
      res.json(users);
    });
  });

  // Cria um usuário
  router.post('/create', async (req, res, next) => {
      const bcrypt = require("bcrypt");
      console.log(req.body)
      const userInfo = {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        role: (req.body.role === "ADMIN") ? "ADMIN" : "USER", 
      }

      repository.insertUser(userInfo, (err, user) => {

        if (!err && user){
          res.status(201).json(user);
        }
        else{
          res.sendStatus(500);
        }
        repository.disconnect();
      });
    }
  );
  
  // Retorna um usuário por ID ou Email
  router.get('/:param', async (req, res, next) => {
    repository.getUser(req.params.param, (err, user) => {
      if(err) return next(err);
      
      if (user){
        res.json(user);
      }
      else{
        res.sendStatus(404);
      }
    });
  });

  // Remove por ID
  router.delete('/:id', async (req, res, next) => {
    repository.removeUserById(req.params.id, (err, user) => {
      if(err) return next(err);

      if (user){
        res.json(user);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });

  // Verfica se o e-mail já esta cadastrado
  router.get("/:email/available", async (req, res, next) => {
    repository.getUser(req.params.email, (err, user) => {
      if(err) return next(err);
      if (user){
        res.json({ available: "false" });
      }
      else{
        res.json({ available: "true" });
      }
      repository.disconnect();
    });
  });

   // Retorna um favorito de um usuario por ID
  router.get("/:userID/favorites/:favoriteID", async (req, res, next) => {
    if(ObjectId.isValid(req.params.userID) && ObjectId.isValid(req.params.favoriteID)) {
      repository.getFavoriteById(req.params.userID, req.params.favoriteID, (err, result) => {
        if(err) return next(err);

        if (result.favorites){
          res.json(result.favorites);
        }
        else{
          res.sendStatus(404);
        }
        repository.disconnect();
      });
    }
    else {
      return res.sendStatus(400);
    }
  });

  // Retorna favoritos por pagina
  router.get("/:userID/favorites/page/:page", async (req, res, next) => {
    const page = Number(req.params.page) || 1;

    repository.getFavoritePerPage(req.params.userID, page, (err, result) => {
      if(err) return next(err);

      if (Object.keys(result[0])){
        res.json(result[0]);
      }
      else{
        res.sendStatus(404);
      }
      repository.disconnect();
    });
  });

  // Adicionar favorito
  router.put('/:userID/favorites', async (req, res, next) => {

    const userID = req.params.userID;

    repository.getFavoriteById(userID, req.body.book_id, (err, favorite) => {

      if(favorite.legth) {
        return res.sendStatus(304);
      }
      else {
        // Busca informações do livro
        adapterGet(`${process.env.BOOK_SERVICE}/${req.body.book_id}`, res, (res, resp)  => {
          const book = resp.data;
          const newFavorite = {
            _id: book._id,
            title: book.title,
            poster_path: book.poster_path,
            authors: book.authors,
            summary: book.summary,
            genre: book.genre,
            type: book.type,
          };

          repository.addFavorite(userID, newFavorite, (err, result) => {
            if (!err && result){
              res.status(201).json({newFavorite});
            }
            else{
              console.log(err)
              res.sendStatus(400);
            }
            repository.disconnect();
          });
        });
      }
    });
  });

  // Remover favorito
  router.delete('/:userID/favorites/:bookID', async (req, res, next) => {

    const userID = req.params.userID;
    const bookID = req.params.bookID;

    if (ObjectId.isValid(userID) && ObjectId.isValid(bookID)) {
      repository.removeFavorite(req.params.userID, req.params.bookID, (err, result) => {
        if (!err && result){
          res.status(201).json({ _id: bookID });
        }
        else{
          console.log(err)
          res.sendStatus(400);
        }
        repository.disconnect();
      });
    }
    else {
      res.sendStatus(400);
    }
    
  });
}
