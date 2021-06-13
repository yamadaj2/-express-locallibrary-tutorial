var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(function () {
    return this.family_name + ', ' + this.first_name;
  });

// Virtual for author's lifespan
AuthorSchema
  .virtual('lifespan')
  .get(function () {
    const {date_of_death, date_of_birth} = this

    if (date_of_death && date_of_birth) {
      return `${date_of_birth.getFullYear()} - ${date_of_death.getFullYear()}`
    }

    if (date_of_birth && !date_of_death) return `${date_of_birth.getFullYear().toString()} - present`
    return 'N/A'
  });

// Virtual for author's URL
AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id;
  });

//Export model
module.exports = mongoose.model('Author', AuthorSchema);