const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getAllCards, createCard, deleteCard, getLikeCard, deleteLikeCard,
} = require('../controllers/cards');

cardsRouter.get('/cards', getAllCards);
cardsRouter.post(
  '/cards',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().pattern(/^(http|https):\/\/[^ "]+$/),
    }),
  }),
  createCard,
);

cardsRouter.delete('/cards/:cardId',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().required().length(24).hex(),
    }),
  }),
  deleteCard);

cardsRouter.put('/cards/likes/:cardId',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().required().length(24).hex(),
    }),
  }), getLikeCard);
cardsRouter.delete('/cards/likes/:cardId', celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().alphanum().length(24),
  }),
}), deleteLikeCard);

module.exports = cardsRouter;
