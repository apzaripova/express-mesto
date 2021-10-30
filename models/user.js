const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    required: true,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(v) {
        return /(:?(?:https?:\/\/)?(?:www\.)?)?[-a-z0-9]+\.\w/g.test(v);
      },
      message: 'Некорректный url',
    },
  },
  email: {
    required: true,
    type: String,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Введен некорректный email',
    },
  },
  password: {
    required: true,
    type: String,
    minlength: 8,
    select: false,
  },
});

module.exports = mongoose.model('user', userSchema);
