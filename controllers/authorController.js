var Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');

exports.author_list = function(req, res, next) {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) return next(err)
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

// Display detail page for a specific Author.
exports.author_detail = function({params: {id}}, res, next) {
  async.parallel({
    author: function(callback) {
      Author.findById(id).exec(callback)
    },
    authors_books: function(callback) {
      Book.find({ 'author': id },'title summary').exec(callback)
    },
  }, function(err, {author, authors_books}) {
    if (err) return next(err)
    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }

    res.render('author_detail', { title: 'Author Detail', author, author_books: authors_books } );
  });
};


exports.author_create_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author create GET');
};

exports.author_create_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author create POST');
};

exports.author_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete GET');
};

exports.author_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete POST');
};

exports.author_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update GET');
};

exports.author_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update POST');
};