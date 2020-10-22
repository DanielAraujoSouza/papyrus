const { adapterGet } = require('../adapter');

module.exports = (router) => {
  // Retorna Lista de usuários
  router.get('/:type/:searchName?/:page?', (req, res, next) => {

    const searchType = req.params.type;
    const searchName = req.params.searchName || "";
    const page = parseInt(req.params.page) || 1;

    let url = `${process.env.BOOK_SERVICE}/printed`;
    if (searchType === 'ebook') {
      url = `${process.env.BOOK_SERVICE}/ebook`;
    } 
    else if (searchType === 'author') {
      url = `${process.env.AUTHORS_SERVICE}`;
    }
    
    adapterGet(`${url}/find/${searchName}/${page}`, res, (res, resp)  => {
      res.header(resp.headers);
      res.send(resp.data);
    });
  });
}