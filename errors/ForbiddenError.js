class ForbiddenError extends Error {
  constructor(messsage) {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = ForbiddenError;