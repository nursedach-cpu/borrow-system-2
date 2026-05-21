// Wraps async route handlers so thrown errors flow to errorHandler.
// Eliminates the try/catch boilerplate that was duplicated across every route.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
