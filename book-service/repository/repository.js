const mongoose = require('mongoose');
const mongodb = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;
const ITEMS_PER_PAGE = 15;

const BookSchema = new Schema({
  title: {
    type: String, 
    unique: true,
    required: true
  },
  poster_path: {
    type: String
  },
  authors: [{
    name: {
      type: String, 
      maxlength: 100,
      required: true
    },
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    }
  }],
  summary: {
    type: String, 
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  type: {
    type: String,
    enum : ['printed','ebook'],
    default: 'printed'
  }
}, { 
  collection: 'books',
  autoIndex: false 
});

BookSchema.index({
  title: 'text', 
  "authors.name": 'text', 
  summary: 'text', 
  genre: 'text',
  type: 'text'
},
{ 
  default_language: 'pt' 
});

const Book = mongoose.model("Book", BookSchema);
Book.createIndexes();

async function getBooksByAuthorID(id, callback) {
  mongodb.connect(async err => {
    Book.find( {"authors._id": id }, {__v: 0}, callback);
  });
};

async function getBook(id, callback) {
  mongodb.connect(async err => {
    Book.findById(id, {__v: 0}, callback);
  });
};

async function findBook(type, param, page, callback) {
  mongodb.connect(async err => {
    const match = param ? { $text: { $search: param }, type: type } : { type: type };
    const sort =  param ? { score: { $meta: "textScore" } } : { title: 1 };
    Book.aggregate(
      [
        { $match: match },
        { $sort: sort },
        { $project: {__v: 0}},
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

async function insertBook(book, callback) {
	mongodb.connect(async err => {
    const newBook = new Book(book);
    newBook.save(callback);
  });
};

async function disconnect() {
  return await mongodb.disconnect();
};

module.exports = {
  getBook,
  getBooksByAuthorID,
  findBook,
  insertBook,
  disconnect
}
