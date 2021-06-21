const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

AuthorSchema
  .virtual('name')
  .get(() => `${this.family_name}, ${this.first_name}`);

AuthorSchema
  .virtual('lifespan')
  .get(() => {
    const {date_of_death, date_of_birth} = this

    if (date_of_death && date_of_birth) {
      return `${date_of_birth.getFullYear()} - ${date_of_death.getFullYear()}`
    }

    if (date_of_birth && !date_of_death) return `${date_of_birth.getFullYear().toString()} - present`
    return 'N/A'
  });

AuthorSchema
  .virtual('url')
  .get(() => `/catalog/author/${this._id}`);

module.exports = mongoose.model('Author', AuthorSchema);