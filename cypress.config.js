const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      managerPortalUrl: 'http://localhost:8002',
      routeHostUrl: 'http://localhost:8000',
    },
  },
});
