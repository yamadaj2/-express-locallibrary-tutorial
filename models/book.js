const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema(
  {
    title: {type: String, required: true},
    summary: {type: String, required: true},
    isbn: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'genre'}]
  }
);

BookSchema
  .virtual('url')
  .get(() => `/catalog/book/${this._id}`);

module.exports = mongoose.model('Book', BookSchema);