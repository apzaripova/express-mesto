const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const usersRouters = require('./routes/users.js');
const cardsRouters = require('./routes/cards.js');
const nonexistentRouter = require('./routes/nonexistent');

const app = express();

app.use(bodyParser.json();
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    id: '615ed06e78e94cbd4b5fd1f7',
  };

  next();
});

app.use('/', usersRouters);
app.use('/', cardsRouters);
app.all('/', nonexistentRouter);

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
    useFindAndModify: false
});

const { PORT = 3000 } = process.env;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})