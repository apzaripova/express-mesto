const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { isURL } = require('validator');

const {
  getUsers, getMe, updateUser, updateUserAvatar, getCurrentUser,
} = require('../controllers/users');
const BadRequestError = require('../errors/BadRequestError');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/me', getCurrentUser);
usersRouter.get(
  '/users/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().hex().required().length(24),
    }),
  }),
  getMe,
);
usersRouter.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    }),
  }),
  updateUser,
);
usersRouter.patch(
  '/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.custom((value) => {
        if (!isURL(value, { require_protocol: true })) {
          throw new BadRequestError('Ссылка на аватарку неверна');
        }

        return value;
      }),
    }),
  }),
  updateUserAvatar,
);

module.exports = usersRouter;
