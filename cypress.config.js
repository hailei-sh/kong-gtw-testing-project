const { defineConfig } = require("cypress");
const { db } = require('./cypress/dbHelper');

module.exports = defineConfig({
  env: {
    managerPortalUrl: 'http://localhost:8002',
    routeHostUrl: 'http://localhost:8000',

    // Database connection settings
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_USER: 'kong',
    DB_PASS: 'kong',
    DB_NAME: 'kong',
  },

  e2e: {
    setupNodeEvents(on, config) {
      const tasks = {};

      for (const [key, value] of Object.entries(db)) {
        if (typeof value === 'function') {
          tasks[key] = async (args) => {
            try {
              return await value(args);
            } catch (err) {
              console.error(`Error in db.${key}:`, err.message);
              throw err;
            }
          };
        }
      }

      // register custom db tasks
      on('task', tasks);
      on('task', {
        async deleteAllKongGatewayEntityData() {
          await db.deletePlugins();
          await db.deleteRoutes();
          await db.deleteServices();
          await db.deleteConsumers();
          await db.deleteBasicAuths();
          return null;
        }
      });

      // register allure plugin
      try {
        const allureWriter = require('@shelex/cypress-allure-plugin/writer');
        allureWriter(on, config);
      } catch (err) {
        console.warn('Allure plugin not registered:', err && err.message);
      }

      return config;
    },
  },
});
