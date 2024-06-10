// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  suites: {},
  allScriptsTimeout: 11000,
  specs: [],
  multiCapabilities: [{
    'browserName': 'chrome'
  }],
  directConnect: true,
  baseUrl: 'https://localhost:5999/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  },
  params: {
     baseUrl: 'local'
  }
};
