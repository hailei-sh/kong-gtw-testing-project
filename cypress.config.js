const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // register allure plugin
      try {
        const allureWriter = require('@shelex/cypress-allure-plugin/writer');
        allureWriter(on, config);
      } catch (err) {
        // plugin might not be installed in local env; CI will install
        // eslint-disable-next-line no-console
        console.warn('Allure plugin not registered:', err && err.message);
      }
      return config;
    },
    env: {
      managerPortalUrl: 'http://localhost:8002',
      routeHostUrl: 'http://localhost:8000',
    },
  },
});
