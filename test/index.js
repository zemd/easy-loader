'use strict';

const test = require('ava');
const path = require('path');

test('Config loads development configs and merges them with .localrc values', t => {
  t.plan(2);

  process.env.NODE_ENV = 'development';
  process.chdir(path.join(__dirname, 'fixtures/local'));

  const config = require('../index')({
    cwd: path.join(__dirname, 'fixtures/local'),
  });

  t.deepEqual(config('mysql'), {
    host: 'mylocal.mysql.com',
    user: 'superroot',
    password: 'passw0rd',
    database: 'project',
    port: 3306
  });

  t.is(config('usedb'), false);
});

test('Config loads development configs and .localrc doesn\'t exist', t => {
  t.plan(2);

  process.env.NODE_ENV = 'development';
  process.chdir(path.join(__dirname, 'fixtures/prod'));

  const config = require('../index')({ cwd: path.join(__dirname, 'fixtures/prod') });

  t.deepEqual(config('mysql'), {
    host: 'development.mysql.com',
    user: 'superroot',
    password: 'passw0rd',
    database: 'project',
    port: 3306
  });

  t.is(config('usedb'), false);
});

test('Config function can apply default values if no config key found', t => {
  t.plan(4);

  process.env.NODE_ENV = 'development';
  process.chdir(path.join(__dirname, 'fixtures/prod'));

  const config = require('../index')({ cwd: path.join(__dirname, 'fixtures/prod') });

  t.is(config('unknown', 'defaultValue'), 'defaultValue');
  t.is(config('unknown', false), false);
  t.is(config('unknown', null), null);
  t.deepEqual(config('unknown', []), []);
});

test('Config loaded for default environment when environment file is missing', t => {
  t.plan(1);

  process.env.NODE_ENV = 'production';
  process.chdir(path.join(__dirname, 'fixtures/prod'));

  const config = require('../index')({ cwd: path.join(__dirname, 'fixtures/prod') });

  t.deepEqual(config('mysql'), {
    host: 'localhost',
    port: 3306,
    database: 'project',
    user: 'root',
    password: 'password'
  });
});

test('Load only environment file and skip defaults', t => {
  t.plan(1);

  process.env.NODE_ENV = 'staging';
  process.chdir(path.join(__dirname, 'fixtures/prod'));

  const config = require('../index')({
    cwd: path.join(__dirname, 'fixtures/prod'),
    mergeWithDefaults: false
  });

  t.deepEqual(config('mysql'), {
    host: 'staging.mysql.com',
    user: 'staging_root',
    password: 'passw0rd'
  });
});

test('Do not load rc file even if it exists', t => {
  t.plan(1);

  process.env.NODE_ENV = 'staging';
  process.chdir(path.join(__dirname, 'fixtures/local'));

  const config = require('../index')({
    cwd: path.join(__dirname, 'fixtures/local'),
    useRC: false,
    mergeWithDefaults: false
  });

  t.deepEqual(config('mysql'), {
    host: 'staging.mysql.com',
    user: 'staging_root',
    password: 'passw0rd'
  });
});
