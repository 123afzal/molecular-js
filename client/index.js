'use strict';

const { ServiceBroker } = require('moleculer');
const config = require('../config');
const logger = require('../lib/logger')(__filename);

// Create broker
const broker = new ServiceBroker({
  namespace: 'demo-micro-service',
  nodeID: 'client',
  transporter: config.get('nats'),
  logger: logger
});

// Call actions
broker.start()
  .then(() => {
    return broker.call('math.add', { a: 5, b: 3 });
  })
  .then((res) => broker.logger.info('  5 + 3 = ' + res))
  .then(() => {
    return broker.call('math.add', { a: 5, b: 3 });
  })
  .then((res) => broker.logger.info(' from cache  5 + 3 = ' + res))
  .then(() => {
    return broker.call('users.list').then((res) => broker.logger.info('Users count:' + res.length));
  })
  .then(() => {
    broker.emit('user.created', { hello: 'world !!!' }, ['users']);
    return broker.call('users.list').then((res) => broker.logger.info('Users count from cache:' + res.length));
  })
  .then(() => {
    return broker.call('math.add', { a: -5, b: -3, sex: 'test' });
  })
  .catch((err) => {
    broker.logger.error(`Error occurred! Action: '${err.ctx.action.name}', Message: ${err.code} - ${err.message}`);
    if (err.data) {broker.logger.error('Error data:', err.data);}
  });

