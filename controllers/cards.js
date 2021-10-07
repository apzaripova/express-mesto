const Card = require('../models/card');

const getAllCards = (req, res) => {
  Card.find({})
  .then((cards) => {
    res.status(200).send(cards)
  })
  .catch((err) => {
    res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
  })
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
  .then((card) => {
    res.status(200).send(card);
  })
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Карточка не найдена' });
    }
      return res.status(500).send({ message: 'Ошибка на сервере'})
  });
}

const deleteCard = (req,res) => {
  Card.findByIdAndRemove(req.params.id)
  .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(404).send({ message: 'Карточка не найдена.' });
      }
        return res.status(500).send({ message: 'Ошибка на сервере' });
    });
}

const getLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((likes) => {
      if (!likes) {
        return res.status(404).send({ message: 'Карточки не существует' });
      }
      return res.status(200).send(likes);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Карточка не найдена' });
      }
      return res.status(500).send({ message: 'Ошибка на сервере' });
    });
}

const deleteLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((likes) => {
      if (!likes) {
        return res.status(404).send({ message: 'Карточки не существует' });
      }
      return res.status(200).send(likes);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Карточка не найдена' });
      }
      return res.status(500).send({ message: 'Ошибка на сервере' });
    });
}

module.exports = {
  getAllCards,
  createCard,
  deleteCard,
  getLikeCard,
  deleteLikeCard
};