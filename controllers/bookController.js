const Author = require('../models/author');
const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
const Genre = require('../models/genre');
const async = require('async');

const { body, validationResult } = require('express-validator');

exports.index = (req, res) => {
  async.parallel({
    book_count: callback => Book.countDocuments({}, callback),
    book_instance_count: callback => BookInstance.countDocuments({}, callback),
    book_instance_available_count: callback => BookInstance.countDocuments({status:'Available'}, callback),
    author_count: callback => Author.countDocuments({}, callback),
    genre_count: callback => Genre.countDocuments({}, callback),
  }, (err, results) => {
    res.render('index', { title: 'Local Library Home', error: err, data: results });
  });
};

exports.book_list = (req, res, next) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec( (err, list_books) => {
      if (err) return next(err)
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

exports.book_detail = ({params: {id}}, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: (callback) => {
      BookInstance.find({ 'book': id })
        .exec(callback);
    },
  }, (err, {book, book_instance}) => {
    if (err) return next(err)
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    res.render('book_detail', { title: book.title, book, book_instances: book_instance } );
  });
};

exports.book_create_get = (req, res, next) => {
  async.parallel({
    authors: callback => Author.find(callback),
    genres: callback => Genre.find(callback),
  }, (err, {authors, genres}) => {
    if (err) return next(err)
    res.render('book_form', { title: 'Create Book', authors, genres});
  });
};

exports.book_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)){
      if (typeof req.body.genre ==='undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  (req, res, next) => {
    const {body: {title, author, summary, isbn, genre}} = req;
    const errors = validationResult(req);

    const book = new Book({title, author, summary, isbn, genre});

    if (!errors.isEmpty()) {
      async.parallel({
        authors: callback => Author.find(callback),
        genres: callback => Genre.find(callback),
      }, (err, {genres, authors}) => {
        if (err) return next(err)

        for (let i = 0; i < genres.length; i++) {
          if (book.genre.indexOf(genres[i]._id) > -1) {
            genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Create Book', authors:authors, genres, book, errors: errors.array() });
      });
      return;
    }

    book.save(err => {
      if (err) return next(err)
      res.redirect(book.url);
    });
  }
];

exports.book_delete_get = (req, res) => res.send('NOT IMPLEMENTED: Book delete GET');

exports.book_delete_post = (req, res) => res.send('NOT IMPLEMENTED: Book delete POST');

exports.book_update_get = (req, res, next) => {
  async.parallel({
    book: callback => Book.findById(req.params.id).populate('author').populate('genre').exec(callback),
    authors: callback => Author.find(callback),
    genres: callback => Genre.find(callback),
  }, (err, results) => {
    if (err) return next(err)
    if (!results.book) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }

    for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
      for (let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
        if (results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString()) {
          results.genres[all_g_iter].checked = 'true';
        }
      }
    }
    res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
  });
};

exports.book_update_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const {body: {title, author, summary, isbn}, params: {id}} = req;

    const book = new Book({ title, author, summary, isbn, genre: (typeof genre === 'undefined') ? [] : genre, _id: id });

    if (!errors.isEmpty()) {
      async.parallel({
        authors: callback => Author.find(callback),
        genres: callback => Genre.find(callback),
      }, (err, {genres, authors}) => {
        if (err) return next(err)

        for (let i = 0; i < genres.length; i++) {
          if (book.genre.indexOf(genres[i]._id) > -1) {
            genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Update Book', authors, genres, book, errors: errors.array() });
      });
      return;
    }

    Book.findByIdAndUpdate(req.params.id, book, {}, (err, theBook) => {
      if (err) return next(err)
      res.redirect(theBook.url);
    });
  }
];