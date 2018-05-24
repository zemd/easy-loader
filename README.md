# Easy loader

> Simple & lightweight configuration loader for every day usage.

Easy loader helps to organize configuration files with hierarchical structured data inside.

[![npm version](https://badge.fury.io/js/easy-loader.svg)](https://www.npmjs.com/package/easy-loader)
[![Build Status](https://travis-ci.org/zemd/easy-loader.svg?branch=master)](https://travis-ci.org/zemd/easy-loader)
[![Code Climate](https://codeclimate.com/github/zemd/easy-loader/badges/gpa.svg)](https://codeclimate.com/github/zemd/easy-loader)
[![CircleCI](https://circleci.com/gh/zemd/easy-loader/tree/master.svg?style=svg)](https://circleci.com/gh/zemd/easy-loader/tree/master)
[![dependencies:?](https://img.shields.io/david/zemd/easy-loader.svg)](https://david-dm.org/zemd/easy-loader)
[![devDependencies:?](https://img.shields.io/david/dev/zemd/easy-loader.svg?style=flat)](https://david-dm.org/zemd/easy-loader)
[![Greenkeeper badge](https://badges.greenkeeper.io/zemd/easy-loader.svg)](https://greenkeeper.io/)

## Installation

```bash
npm install easy-loader --save
```

or

```bash
yarn add easy-loader
```

## Usage

### Basic file structure

```
root
|- config
|--- default.js     // <-- optional file, but recommended to add here default values 
|--- development.js
|--- staging.js
|--- production.js
|- config.js        // <-- the only one file you rely on in your application
|- .localrc         // <-- possibly you've already been using 'rc' module
```

### Use configs in your app

Suppose you define your entry point for accessing configs `config.js`
```javascript
const optionalCustomOptions = {
 pattern: ['config/<%=NODE_ENV%>.js', 'configs/<%=NODE_ENV%>.js', '<%=NODE_ENV%>.js'],
 patternVars: { NODE_ENV: process.env.NODE_ENV || 'development' },
 patternDefaultVars: { NODE_ENV: 'default' },
 cwd: process.cwd(),
 useRC: true,
 rcOpts: { prefix: 'local' },
 mergeWithDefaults: true,
};
module.exports = require('easy-loader')(optionalCustomOptions);
```

And now you can use any of your config options from any place in your code, for example:

```javascript
const config = require('./path/to/config');
const pg = require('pg');

const pgClient = pg.Client(config('database.pg')); // also available by using dot notation like: config.database.pg
```

### Configuration

You may define different behavior to `easy-loader` by passing options from previous example.

`pattern` - array or string - template path to configuration files, should use lodash.template format

`patternVars` - object - contains all variables needed to be passed into pattern template

`patternDefaultVars` - object - same as `patternVars`, but contains values to reach default file

`cwd` - string - root directory where files are searching

`useRC` - boolean - whether or not to use `rc` library

`rcOpts` - object - currently `rcOpts.prefix` is used only, but can be extended in future

`mergeWithDefaults` - boolean - whether or not to merge values with content from default file

### Advanced usage

TODO:

## License

Easy loader is released under the MIT license.

## Donation

[![](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/red_rabbit)
[![](https://img.shields.io/badge/flattr-donate-yellow.svg)](https://flattr.com/profile/red_rabbit)
