var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

exports.genre_list = function(req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_genres) {
      if (err) return next(err)
      res.render('genre_list', {title: 'Genre List', genre_list: list_genres})
    })
};

exports.genre_detail = function(req, res, next) {
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.params.id)
        .exec(callback);
    },

    genre_books: function(callback) {
      Book.find({ 'genre': req.params.id })
        .exec(callback);
    },

  }, function(err, {genre, genre_books}) {
    if (err) return next(err)
    if (!genre) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }

    res.render('genre_detail', { title: 'Genre Detail', genre, genre_books } );
  });
};


exports.genre_create_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Genre create GET');
};

exports.genre_create_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Genre create POST');
};

exports.genre_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genre_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genre_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genre_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST');
};