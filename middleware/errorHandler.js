const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

exports.errorConverter = (err, req, res, next) => {
  let error = err;
  console.log(`err`,err)
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;

    const message = error.message
      ? 'Oops, an unexpected error occurred'
      : 'Internal server error, please try again later';
    error = new ApiError(message, statusCode, false);
  }
  next(error);
};

exports.errorHandler = (err, req, res, next) => {
  const { statusCode = httpStatus.INTERNAL_SERVER_ERROR, message } = err;

  res.locals.error = err;

  const response = {
    code: statusCode,
    message: message,
    status: 'error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  };

  res.status(statusCode).json(response);
};
