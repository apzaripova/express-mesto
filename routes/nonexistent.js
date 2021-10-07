const nonexistentRouter = require('express').Router();

nonexistentRouter.all('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});

module.exports = nonexistentRouter;