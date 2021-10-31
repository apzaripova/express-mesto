const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

function getUsers(req, res, next) {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
}

const getCurrentUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => res.send(user))
    .catch((err) => {
      res.send(err);
    })
    .catch(next);
};

const getMe = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
      res.status(200).send(user);
    })
    .catch(next);
};

// контроллер создания пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!validator.isEmail(email)) {
    throw new BadRequestError('Некорректный email');
  }
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
      if (err.name === 'MongoError' || err.code === '11000') {
        throw new ConflictError('Такой email уже зарегистрирован');
      }
    })
    .then((user) => res.status(200).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
      _is: user._id,
    }))
    .catch(next);
};

// контроллер обновления пользователя
const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      }
      next(err);
    })
    .catch(next);
};

// контроллер обновления аватара
const updateUserAvatar = (res, req, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) {
        res.status(user);
      } else {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      }
      next(err);
    })
    .catch(next);
};

// контроллер Логин
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' },
      );
      res.send({ token: token.toString() });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getMe,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
  getCurrentUser,
};
