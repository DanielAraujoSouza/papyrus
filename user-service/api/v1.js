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
}
