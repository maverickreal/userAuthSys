const awilix = require('awilix');
require('dotenv').config();

const container = awilix.createContainer();

container.register({
  allowedUpdates: awilix.asValue(['firstName', 'lastName', 'age'])
});

