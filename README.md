# Easy loader

Easy helper function to load configs and services.

[![npm version](https://badge.fury.io/js/easy-loader.svg)](https://www.npmjs.com/package/easy-loader)
[![Build Status](https://travis-ci.org/zemd/easy-loader.svg?branch=master)](https://travis-ci.org/zemd/easy-loader)
[![Code Climate](https://codeclimate.com/github/zemd/easy-loader/badges/gpa.svg)](https://codeclimate.com/github/zemd/easy-loader)
[![CircleCI](https://circleci.com/gh/zemd/easy-loader/tree/master.svg?style=svg)](https://circleci.com/gh/zemd/easy-loader/tree/master)

## Installation

```bash
npm install easy-loader --save
```

or

```bash
yarn add easy-loader
```

## Usage

 1. The main purpose of this library is to organize loading configs files. Usually configs files are stored in separate
 folder and are loaded depending on environment variable such as NODE_ENV. 
 Also developers have their own configurations that should be used only on their local environment.

    Suppose you have next file structure:

     ```
      |- configs
      |--- defaults.js // <-- this file is not required but recommended to add here values from env vars
      |             -> example: module.exports = { env: process.env.NODE_ENV, myvar: utilities.getBoolFromEnvVar('MY_FEATURE_ENABLED')  }
      |--- development.js
      |--- staging.js
      |- config.js // <-- the only one file you rely on
      |- .localrc // <-- possibly you've already been using 'rc' module
     ```
     
     Your `config.js` that the only file you can rely on during development, will contain:
      
    ```javascript
    module.exports = require('easy-loader')({});
    ```

    Second parameter can hold next options:
    
    * __pattern__ - default equals to `configs/<%=NODE_ENV%>.js` - lodash template string, defining your load file path
    * __variables__ - object with variables that are passed to template string 
    * __cwd__ - default equals to `process.cwd()` - directory where your configs folder placed
    * __rc__ - default equals to `{prefix: 'local'}` - options related to `rc` library - if set to `false` then rc will not be loaded, else should be an object with prefix of rc file 
    * __mergeWithDefaults__ - default equals to `true` - defines whether default file should be loaded and merged
    * __returnHelperFn__ - default equals to `true` - defines whether helper function should be returned. See examples.
  
    After you made this, nodejs will cache your configuration options and it won't hit performance.
  
    Example:
  
    ```javascript
    // Somewhere in your files
    const config = require('../path/to/cwd/config.js'); // loading previously described file
    
    // you can use helper function(that actually is _.get from lodash) to avoid silly errors with unknown nested keys in configuration objects
    console.log(config('mysql.database', 'default value if mysql.database does not present'));
    // 1. if mysql.database not exits it won't fail your application
    // 2. you can always provide default value if needed
    
    // BUT if you want you can use config object as regular object
    console.log(config.mysql.database);
    ```

 2. Second purpose of this module is to make easy to use DI in nodejs
  
    Javascript doesn't have dependency injection due to it's nature. But sometimes we need to mock dependencies on third party services. So we can use standard module mechanism, that gives big transparency during development and testing.
     
    So you have several service's containers defined inside files:
    
    ```
    |- services
    |--- services.defaults.js
    |       -> module.exports = { MyThirdPartyService: new MyThirdPartyService(config('option1'), config('option2')) }
    |--- services.test.js
    |       -> module.exports = { MyThirdPartyService: sinon.createStubInstance(MyThirdPartyService)} 
    |--- services.staging.js
    |- services.js
    ```

    Pretty common usage, similar to previous example. So `services.js` will contain:
     
     ```javascript
     module.exports = require('easy-loader')({
      pattern: 'services/services.<%=NODE_ENV%>.js',
      mergeWithDefaults: false,
      rc: false // or true if you need to define your local services 
     });
     ```
     
     That's it! Now you can use it like you usually use module import.
      
      ```javascript
      const {MyThirdPartyService} = require('../path/to/cwd/services.js');
      ```
      
      Tip: if you need add service factory which will return new instance each time it can be simply implemented via pure functions in your services' containers, like:
      
      ```javascript
      module.exports = {MyServiceFactory: () => new MyService(config('options'))}
      ```
      

## License

Easy loader is released under the MIT license.

## Donation

[![](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/red_rabbit)
[![](https://img.shields.io/badge/flattr-donate-yellow.svg)](https://flattr.com/profile/red_rabbit)

