const Author = require('../models/author');
const async = require('async');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

exports.author_list = (req, res, next) => {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) return next(err)
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

exports.author_detail = ({params: {id}}, res, next) => {
  async.parallel({
    author: callback => Author.findById(id).exec(callback),
    authors_books: callback => Book.find({ 'author': id },'title summary').exec(callback),
  }, (err, {author, authors_books}) => {
    if (err) return next(err)
    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }

    res.render('author_detail', { title: 'Author Detail', author, author_books: authors_books } );
  });
};

exports.author_create_get = (req, res) => {
  res.render('author_form', {title: 'Create Author'});
};

exports.author_create_post = [
  body('first_name').trim()
    .isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),

  body('family_name').trim()
    .isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

  body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

  (req, res, next) => {
    const {body} = req;
    const {first_name, family_name, date_of_birth, date_of_death} = body;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.render('author_form', { title: 'Create Author', author: body, errors: errors.array() });
      return;
    }

    const author = new Author({first_name, family_name, date_of_birth, date_of_death});
    author.save( err => {
      if (err) return next(err)

      res.redirect(author.url);
    });
  }
];

exports.author_delete_get = ({params: {id}}, res, next) => {
  async.parallel({
    author: callback => Author.findById(id).exec(callback),
    authors_books: callback => Book.find({ 'author': id }).exec(callback),
  }, (err, {author, authors_books}) => {
    if (err) return next(err)
    if (!author) res.redirect('/catalog/authors');
    res.render('author_delete', { title: 'Delete Author', author, author_books: authors_books } );
  });
};

exports.author_delete_post = ({body: {authorid}}, res, next) => {
  async.parallel({
    author: callback => Author.findById(authorid).exec(callback),
    authors_books: callback => Book.find({ 'author': authorid }).exec(callback),
  }, (err, {author, authors_books}) => {
    if (err) return next(err)

    if (authors_books.length > 0) {
      res.render('author_delete', { title: 'Delete Author', author, author_books: authors_books } );
      return;
    }

    Author.findByIdAndRemove(authorid, function deleteAuthor(err) {
      if (err) return next(err)
      res.redirect('/catalog/authors')
    })
  });
};

exports.author_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update GET');
};

exports.author_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update POST');
};