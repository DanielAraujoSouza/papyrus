const mongoose = require('mongoose');
const mongodb = require("../config/mongodb");
const Schema = mongoose.Schema;
const ITEMS_PER_PAGE = 15;

const AuthorSchema = new Schema({
  name: {
    type: String, 
    required: true
  },
  poster_path: {
    type: String
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  date_of_death: {
    type: Date,
  },
  description: {
    type: String, 
    required: true
  },
}, { 
  collection: 'authors',
  autoIndex: false 
});

AuthorSchema.index({ name: 'text', description: 'text'}, {
  default_language: 'pt' 
});

const Author = mongoose.model("Author", AuthorSchema);
Author.createIndexes();

async function getAuthor(id, callback) {
  mongodb.connect(async err => {
    Author.findById(id, {__v: 0}, callback);
  });
};

async function getAuthors(callback) {
  mongodb.connect(async err => {
    Author.find(callback);
  });
};

async function findAuthor(param, page, callback) {
  mongodb.connect(async err => {

    const match = param ? { $text: { $search: param }} : {  };
    const sort =  param ? { score: { $meta: "textScore" } } : { name: 1 };

    Author.aggregate(
      [
        { $match: match },
        { $sort: sort },
        { $project: { __v: 0, } },
        { $facet: {
          results: [{ $skip: ITEMS_PER_PAGE * (page - 1) }, { $limit: ITEMS_PER_PAGE }],
          total: [ { $count: 'total' } ]
          }
        },
        { $project: {
            results: '$results', 
            totalCount: { $ifNull: [ { $arrayElemAt: ["$total.total", 0] }, 0 ] },
            totalPages: {
              $ifNull: [ 
                { 
                  $ceil: { 
                    $divide: [{ $arrayElemAt: ["$total.total", 0]}, ITEMS_PER_PAGE ]
                  }
                },
                0
              ]
            }
          }
        }
      ]
   )
   .exec(callback);
  });
};

async function insertAuthor(author, callback) {
	mongodb.connect(async err => {
    const newAuthor = new Author(author);
    newAuthor.save(callback);
  });
};

async function disconnect() {
  return await mongodb.disconnect();
};

module.exports = {
  getAuthor,
  getAuthors,
  findAuthor,
  insertAuthor,
  disconnect
}
