# Kong Gateway Testing Project

This project demonstrates how to test **Kong Gateway** configurations using **Cypress**.

## Project Structure

- **Main test suite file:**  
  `cypress/e2e/kong-gateway-tests/gateway_configuration.cy.js`

- **Setup:**
  - Add `httpbin` to the Dockerfile as a mock upstream service.
  - Include a database helper and register its operations as Cypress tasks.

## Test Suite Overview

The test suite covers the following scenarios:
1. **Before Test**
   - Clean up previous test data to ensure a fresh environment.

2. **Gateway Configuration:**
   - Add a gateway service and verify the corresponding database entry.
   - Add a route and verify the corresponding database entry.
   - Add a consumer and verify the corresponding database entry.

3. **Route and Plugin Validation:**
   - Add the **Basic Auth** plugin.
   - Add the **Rate Limit** plugin.
   - Test the route without authentication.
   - Test the route exceeding the rate limit.

## Continuous Integration

- **GitHub Actions Integration:**
  - The Cypress test suite runs automatically whenever there is a push to the `main` branch.
  - The **Allure** test report is generated and published to the GitHub Pages for easy access.
    - https://hailei-sh.github.io/kong-gtw-testing-project/

## P.S.
Since this is a proof-of-concept project aimed at showcasing automation capabilities, it doesn’t include extensive negative test cases (e.g., boundary value checks). Design patterns such as the Page Object Model are also omitted, as the demo is intentionally kept simple.
