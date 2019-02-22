const routes = require('next-routes')();

routes
  .add('/games/:address', '/games/showGame')
  .add('/about','/about/about');

module.exports = routes;
