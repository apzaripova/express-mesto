const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const NotAuthError = require('../errors/NotAuthError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() => res.status(500).send({ message: 'Ошибка на сервере' }))
    .catch(next);
};

const getUsersById = (req, res, next) => {
  User.findById(req.res.params)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы невалидный id'));
      }
      next(err);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;
  User.create({ name, about, avatar, email, password })

    bcrypt.hash(password, 10)
    .then(hash => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if(err.name === 'MongoError') {
        throw new BadRequestError(err.message);
      }
      if(err.code === 11000) {
          throw new ConflictError(`Пользователь с таким email: ${user.email} существует`);
      }
    })
    .catch(next);
};

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

const getCurrentUser = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      res.send(err);
    })
    .catch(next);
};

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

const login = (req, res, next) => {
  const { email, password } = req.bode;

  return User.findUserByCredentials(email, password)
  ,then((user) => {
    const token = jwt.sign(
      { _id: user._id }
      (NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'),
      { expiresIn: '7d' },
    );
    res.send.cookie('jwt', token, {
      maxAge: 3600000 * 24 * 7,
      httpOnly: true,
      sameSite: true,
    })
    .catch((err) => {
      throw new NotAuthError(err.message);
    })
  })
  .catch(next);
}

module.exports = {
  getUsers,
  getUsersById,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
  getCurrentUser
};
