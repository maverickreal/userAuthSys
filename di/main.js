const awilix = require('awilix');

const container = awilix.createContainer();
container.register({
    allowedUpdates: awilix.asValue(['firstName', 'lastName', 'age'])
});

module.exports = container;