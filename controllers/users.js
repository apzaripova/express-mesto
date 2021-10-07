const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() => res.status(500).send({ message: 'Ошибка на сервере' }));
};

const getUsersById = (req, res) => {
  User.findById(req.res.params)
  .then((user) => {
    if (!user) {
      return res.status(404).send({ message: 'Пользователя не существует' });
    }
    return res.status(200).send({ data: user });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      return res.status(404).send({ message: 'Невалидный id.' });
    }
      return res.status(500).send({ message: 'Внутренняя ошибка сервера.' });
  });
}

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return res.status(400).send({message: 'Переданы некорректные данные'})
    }
      return res.status(500).send({message: 'Внутренняя ошибка сервера'})
  })
}

const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователя не существует' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'Ошибка на сервере' });
    });
}

const updateUserAvatar = (res, req) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователя не существует' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(500).send({ message: 'Ошибка на сервере' });
    });
}

module.exports = {
  getUsers,
  getUsersById,
  createUser,
  updateUser,
  updateUserAvatar
};