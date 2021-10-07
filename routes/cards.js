const cardsRouter =  require('express').Router();

const {getAllCards, createCard, deleteCard, getLikeCard, deleteLikeCard} = require('../controllers/cards');

cardsRouter.get('/cards', getAllCards);
cardsRouter.post('/cards', createCard);
cardsRouter.delete('/cards/:id', deleteCard);
cardsRouter.put('/cards/:cardId/likes', getLikeCard);
cardsRouter.delete('/cards/:cardId/likes', deleteLikeCard);

module.exports = cardsRouter;