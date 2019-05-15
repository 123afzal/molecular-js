'use strict';

const convict = require('convict');
const path = require('path');
const fs = require('fs');

const config = convict({
  env: {
    doc: 'Application Environment',
    format: ['develop', 'qa', 'prod'],
    default: 'develop',
    env: 'NODE_ENV'
  },
  nats: {
    format: String,
    default: 'nats://localhost:4222'
  },
  cacher: {
    type: {
      format: String,
      default: 'Redis'
    },
    options: {
      // Prefix for keys
      prefix: {
        format: String,
        default: 'MOL'
      },
      // set Time-to-live to 30sec.
      ttl: {
        format: Number,
        default: 30
      },
      // Turns Redis client monitoring on.
      monitor: {
        format: Boolean,
        default: false
      },
      // Redis settings
      redis: {
        host: {
          format: String,
          default: 'localhost'
        },
        port: {
          format: 'port',
          default: 6379
        },
        password: {
          format: String,
          default: ''
        },
        db: {
          format: Number,
          default: 0
        }
      }
    }
  }
});

const env = config.get('env');
const configPath = path.join(__dirname, `./${env}.json`);
if (fs.existsSync(configPath)) {
  config.loadFile(configPath);
}
config.validate({ allowed: 'strict' });

module.exports = config;
