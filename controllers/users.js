const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const NotAuthError = require('../errors/NotAuthError');
const ConflictError = require('../errors/ConflictError');

function getUsers(req, res, next) {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
}

const getCurrentUser = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(() => { throw Error('NoData'); })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NoData') {
        throw new NotFoundError(404, 'Пользователь не найден');
      } else if (err.name === 'CastError') {
        throw new BadRequestError(400, 'Переданы некорректные данные');
      }
    })
    .catch(next);
};

const getMe = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(new Error('NoData'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NoData') {
        throw new NotFoundError(404, 'Пользователь не найден');
      }
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
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
      if (err.name === 'MongoError' || err.code === '11000') {
        throw new ConflictError('Такой емейл уже зарегистрирован');
      }
    })
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
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

  let userId;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new NotAuthError('Неправильные почта или пароль');
      }

      userId = user._id;

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new NotAuthError('Неправильные почта или пароль');
      }

      const token = jwt.sign({ _id: userId }, 'some-secret-key', { expiresIn: '7d' });

      res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }).end();
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
