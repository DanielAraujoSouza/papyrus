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
  commentaries: [{
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        required: true
      },
      name: {
        type: String, 
        maxlength: 100,
        required: true
      },
      avatar_path: {
        type: String
      }
    },
    comment_text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
  
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

async function getCommentaryById(authorID, commentId, callback) {
	mongodb.connect(async err => {
    Author.findOne (
      { _id: authorID }, 
      { 'commentaries': { $elemMatch: { '_id': commentId} } },
      { $project: { _id: 0 }}
    )
    .exec(callback);
  });
};

async function removeCommentaryById(authorID, commentId, callback) {
	mongodb.connect(async err => {
    Author.findOneAndUpdate (
      { _id: authorID }, 
      { $pull: { commentaries: {_id: commentId} }}
    )
    .exec(callback);
  });
};

async function insertAuthorCommentary(authorID, newComment, callback) {
	mongodb.connect(async err => {
    Author.findOneAndUpdate (
      { _id: authorID }, 
      { $push: { commentaries: newComment } }
    )
    .exec(callback);
  });
};

async function disconnect() {
  return await mongodb.disconnect();
};

module.exports = {
  getAuthor,
  getAuthors,
  getCommentaryById,
  removeCommentaryById,
  insertAuthorCommentary,
  findAuthor,
  insertAuthor,
  disconnect
}
