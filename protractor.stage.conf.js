const defaultConfig = require('./protractor.conf');
let devConfig = {
  params: {
    baseUrl: 'stage'
 }
};
exports.config = Object.assign(defaultConfig.config, devConfig);
