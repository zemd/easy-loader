'use strict';

const _ = require('lodash');

const path = require('path');
const fs = require('fs');

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

function buildPath(pathTemplateCompiled, cwd, variables) {
  let configPath = pathTemplateCompiled(Object.assign({}, process.env, variables));
  if (!isAbsolutePath(configPath)) {
    configPath = path.join(cwd, configPath);
  }
  return configPath;
}

module.exports = ({
  pattern = 'configs/<%=NODE_ENV%>.js',
  variables = {},
  cwd = process.cwd(),
  defaults = {NODE_ENV: 'defaults'},
  rc = {prefix: 'local'},
  mergeWithDefaults = true,
  returnHelperFn = true
}) => {
  const pathTemplateCompiled = _.template(pattern);
  const buildPathFn = _.partial(buildPath, pathTemplateCompiled, cwd);

  const envFilePath = buildPathFn(variables);
  const defaultFilePath = !!defaults ? buildPathFn(defaults) : '';

  if (!exists(envFilePath) && !exists(defaultFilePath)) {
    throw new Error(`Neither env file exists neither default file!`);
  }

  let mergeResult = _.partial(_.merge, {});

  if (mergeWithDefaults && exists(defaultFilePath)) {
    mergeResult = _.partial(mergeResult, require(defaultFilePath));
  }

  if (exists(envFilePath)) {
    mergeResult = _.partial(mergeResult, require(envFilePath));
  }

  if (!!rc) {
    const rcLib = require('rc');
    const intermediateResult = mergeResult();
    mergeResult = () => rcLib(rc.prefix, intermediateResult);
  }

  const results = mergeResult();

  if (!returnHelperFn) {
    return results;
  }
  return _.merge(_.partial(_.get, results), results);
};
