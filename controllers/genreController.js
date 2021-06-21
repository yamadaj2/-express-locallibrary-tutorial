const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, list_genres) => {
      if (err) return next(err)
      res.render('genre_list', {title: 'Genre List', genre_list: list_genres})
    })
};

exports.genre_detail = (req, res, next) => {
  async.parallel({
    genre: (callback) => Genre.findById(req.params.id).exec(callback),
    genre_books: (callback) => Book.find({ 'genre': req.params.id }).exec(callback),
  }, (err, {genre, genre_books}) => {
    if (err) return next(err)
    if (!genre) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }

    res.render('genre_detail', { title: 'Genre Detail', genre, genre_books } );
  });
};

exports.genre_create_get = (req, res) => {
  res.render('genre_form', { title: 'Create Genre' });
};

exports.genre_create_post = [
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const {body: {name}} = req;
    const errors = validationResult(req);

    const genre = new Genre({ name });

    if (!errors.isEmpty()) {
      res.render('genre_form', { title: 'Create Genre', genre, errors: errors.array()});
      return;
    }

    Genre.findOne({ 'name': name })
      .exec((err, found_genre) => {
          if (err) return next(err)

          if (found_genre) {
            res.redirect(found_genre.url);
          }
          else {
            genre.save( err => {
              if (err) return next(err)
              res.redirect(genre.url);
            });
          }
        }
      );
  }
];

exports.genre_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genre_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genre_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genre_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update POST');
};