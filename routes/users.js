const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getMe, updateUser, updateUserAvatar, getCurrentUser,
} = require('../controllers/users');

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
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  updateUser,
);
usersRouter.patch(
  '/users/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required()
        .regex(/^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w.-]*)*\/?$/),
    }),
  }),
  updateUserAvatar,
);

module.exports = usersRouter;
