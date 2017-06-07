'use strict';

const path = require('path');
const fs = require('fs');

const isObject = require('lodash/fp/isObject');
const template = require('lodash/fp/template');
const merge = require('lodash/fp/merge');
const get = require('lodash/fp/result');
const omit = require('lodash/fp/omit');

const logger = require('logtown')('easy-loader');

//
// Usage:
//
// 1. const config = require('easy-loader');
//    console.log(config('database.username'));
//
// 2. const config = require('easy-loader')({ pattern: 'configs/<%=NODE_ENV%>.js' })
//    console.log(config('database.password'));
//
// Loading process:
//
// 1. NODE_ENV = development
//    [exists] default.js
//    [exists] development.js
//
//    <= merge(development.js, default.js)
//
// 2. NODE_ENV = development
//    [exists] default.js
//    [NOT exists] development.js
//
//    <= content(default.js)
//
// 3. NODE_ENV = development
//    [NOT exists] default.js
//    [NOT exists] development.js
//
//    <= throw Error('At least one file MUST exists')
//
// 4. NODE_ENV = development
//    [NOT exists] default.js
//    [exists] development.js
//
//    <= content(development.js)
//

function isAbsolutePath(p) {
  return path.resolve(p) === path.normalize(p);
}

const exists = (path) => {
  try {
    fs.accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * @param {Function} compiledPattern
 * @param {string} cwd
 * @param {{}} variables
 * @return {string}
 */
function buildPath(compiledPattern, cwd, variables) {
  let configPath = compiledPattern(Object.assign({}, process.env, variables));
  if (!isAbsolutePath(configPath)) {
    configPath = path.join(cwd, configPath);
  }
  return configPath;
}

/**
 * @param variable
 * @return {[*]}
 */
function getArray(variable) {
  return Array.isArray(variable) ? variable : [variable];
}

/**
 * @param {[]} patterns
 * @param {{}} patternVars
 * @param {string} cwd
 */
function findConfigPath(patterns, patternVars, cwd) {
  return patterns
    .map((pattern) => template(pattern))
    .map((compiled) => (variables) => buildPath(compiled, cwd, variables))
    .map((compiledPartial) => {
      try {
        return compiledPartial(patternVars);
      } catch (e) {
        logger.warn(e);
        return false;
      }
    })
    .filter((compiledPath) => compiledPath && exists(compiledPath))
    .reduce((acc, item) => {
      if (!acc) {
        acc = item;
      }
      return acc;
    }, '')
}

function buildConfigFunction({
                               pattern = ['config/<%=NODE_ENV%>.js', 'configs/<%=NODE_ENV%>.js', '<%=NODE_ENV%>.js'],
                               patternVars = { NODE_ENV: process.env.NODE_ENV || 'development' },
                               patternDefaultVars = { NODE_ENV: 'default' },
                               cwd = process.cwd(),
                               useRC = true,
                               rcOpts = { prefix: 'local' },
                               mergeWithDefaults = true,
                             } = {}) {

  let result = {};
  const patterns = getArray(pattern);
  const configPath = findConfigPath(patterns, patternVars, cwd);
  const configDefaultPath = findConfigPath(patterns, patternDefaultVars, cwd);

  if (!configPath && !configDefaultPath) {
    throw new Error('At least one config file MUST exists');
  }

  if (mergeWithDefaults && configDefaultPath) {
    result = merge(result, require(configDefaultPath));
  }

  if (configPath) {
    result = merge(result, require(configPath));
  }

  if (useRC) {
    // result will be mutated by rc internals
    const rcConfig = require('rc')(rcOpts.prefix, {}, {});
    result = merge(result, omit(['config', 'configs'], rcConfig));
  }

  let resultFn = (key, defaultValue) => {
    const val = get(key, result);
    if (typeof val === 'undefined') {
      return defaultValue;
    }
    return val;
  };

  return Object.assign(resultFn, result);
}

module.exports = (...args) => {
  if (isObject(args[0])) {
    return buildConfigFunction(args[0]);
  }

  const conf = buildConfigFunction();
  return conf(...args);
};
