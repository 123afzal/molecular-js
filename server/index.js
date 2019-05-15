'use strict';

const { ServiceBroker } = require('moleculer');
const config = require('../config');
const logger = require('../lib/logger')(__filename);

const broker = new ServiceBroker({
  namespace: 'demo-micro-service',
  nodeID: 'server',
  transporter: config.get('nats'),
  logger: logger,
  cacher: config.get('cacher'),
  validation: true,
  registry: {
    strategy: 'CpuUsage',
    strategyOptions: {
      sampleCount: 3,
      lowCpuUsage: 10
    }
  },
  circuitBreaker: {
    enabled: true,
    threshold: 0.5,
    minRequestCount: 20,
    windowTime: 60, // in seconds
    halfOpenTime: 5 * 1000, // in milliseconds
    check: err => err && err.code >= 500
  }
});

broker.createService({
  name: 'math',
  actions: {
    add: {
      cache: true,
      params: {
        a: { type: 'number', positive: true, integer: true },
        b: { type: 'number', positive: true, integer: true },
        name: { type: 'string', min: 3, max: 255, optional: true },
        sex: { type: 'enum', values: ['male', 'female'], optional: true },
        $$strict: true
      },
      handler(ctx) {
        this.logger.info(' method called');
        return Number(ctx.params.a) + Number(ctx.params.b);
      }
    }
  },
  events: {
    'user.created'(user) {
      this.logger.info('User math created:', user);
    }
  }
});

broker.createService({
  name: 'users',
  actions: {
    list: {
      cache: true,
      handler(ctx) {
        this.logger.info('Handler called!');
        broker.broadcast('user.created', { name: 'mir' }, 'mail');
        return [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ];
      }
    }
  },
  events: {
    'user.created'(user) {
      this.logger.info('User created:', user);
    }
  }
});

broker.start();

