describe('test the gateway configuration function', () => {

    let testData;

    before(() => {
        // Clear all entities before all tests
        const entities = ['plugins', 'consumers', 'routes', 'services'];
        entities.forEach((entity) => cy.deleteEntityTableRows(entity));
        cy.fixture('consumer').then((data) => {
            testData = data;
        });
    });

    beforeEach(() => {
        // Return to the overview page before each test
        cy.visit(`${Cypress.env('managerPortalUrl')}/default/overview`).wait(1000);
    });

    it('add a gateway service', () => {
        cy.get('[data-testid="sidebar-item-gateway-services"] > .sidebar-item-link > .sidebar-item-display').should('contain', 'Services').click({ force: true, delay: 100 }).wait(2000);
        cy.get('[data-testid="empty-state-action"]').should('contain', 'New gateway service').click({ delay: 100 }).wait(1000);
        cy.get('input[checked-group="protocol"]').click();
        cy.get('input[name="host"]').type('httpbin', { delay: 100 });
        cy.get('button[type="submit"]').click()
        cy.wait(2000);
        cy.get('[data-testid="name-plain-text"] > .attrs-data-text')
            .invoke('text').then((text) => {
                Cypress.env('serviceName', text)
            });

        cy.get('[title="Routes"]').should('be.visible').click();
        cy.get('a[type="button"]').contains('New route').click({ delay: 100 });
    });

    it('add a route to the service', () => {
        cy.get('[data-testid="sidebar-item-routes"] > .sidebar-item-link > .sidebar-item-display').should('contain', 'Routes').click({ force: true, delay: 100 }).wait(2000);
        cy.get('[data-testid="empty-state-action"]').should('contain', 'New route').click({ delay: 100 }).wait(1000);
        const serviceName = Cypress.env('serviceName')
        cy.get('input[data-testid="route-form-name"]').type(`test-GET-${serviceName}`);
        cy.get('[data-testid="route-form-service-id"]').click();
        cy.get('.select-item-label').contains(`${serviceName}`).click();
        cy.get('input[data-testid="route-form-tags"]').type('tag1, tag2');
        cy.get('input[data-testid="route-form-paths-input-1"]').type('/get');
        cy.get('input[type="checkbox"]').uncheck();
        cy.get('.multiselect-items-container .multiselect-item').contains('GET').click({ force: true });
        cy.get('input[data-testid="route-form-hosts-input-1"]').type('localhost:8000');
        cy.get('[data-testid="route-create-form-submit"]').click();
    });

    it('add the basic auth plugin to the route', () => {
        cy.get('[data-testid="sidebar-item-plugins"] > .sidebar-item-link > .sidebar-item-display').should('contain', 'Plugins').click({ force: true, delay: 100 }).wait(2000);
        cy.get('[data-testid="empty-state-action"]').should('contain', 'New plugin').click({ delay: 100 });
        cy.get('[data-testid="plugins-filter"]').type('basic auth', { delay: 100 });
        cy.get('[data-testid="basic-auth-card"]').should('be.visible').click({ delay: 100 });
        cy.get('[data-testid="plugin-create-form-submit"]').click({ delay: 100 });
        cy.get('[data-testid="status"]').should('contain', 'Enabled');
    });

    it('add a new consumer', () => {
        cy.get('[data-testid="sidebar-item-consumers"] > .sidebar-item-link > .sidebar-item-display').should('contain', 'Consumers').click({ force: true, delay: 100 }).wait(2000);
        cy.get('[data-testid="empty-state-action"]').should('be.visible').and('contain', 'New Consumer').click({ delay: 100 }).wait(1000);
        cy.get('[data-testid="consumer-form-username"]').type('testconsumer');
        cy.get('[data-testid="consumer-form-custom-id"]').type(crypto.randomUUID());
        cy.get('[data-testid="consumer-form-tags"]').type('tag1, tag2');
        cy.get('[data-testid="consumer-create-form-submit"]').click({ delay: 100 });
        cy.get('#consumer-credentials').should('be.visible').click({ delay: 100 });
        cy.get('[data-testid="empty-state-action"]').should('contain', 'New Basic Auth Credential').click({ delay: 100 });
        cy.get('#password').type(testData.password);
        cy.get('#username').type(testData.username);
        cy.get('[data-testid="plugin-create-form-submit"]').click({ delay: 100 });
    });

    it('add the rate limiting plugin to the route', () => {
        cy.get('[data-testid="sidebar-item-plugins"] > .sidebar-item-link > .sidebar-item-display').should('contain', 'Plugins').click({ force: true, delay: 100 }).wait(2000);
        cy.get('[data-testid="toolbar-add-plugin"]').should('contain', 'New plugin').click({ delay: 100 }).wait(1000);
        cy.get('[data-testid="plugins-filter"]').type('rate limiting', { delay: 100 });
        cy.get('[data-testid="rate-limiting-card"]').scrollIntoView().should('be.visible').click({ delay: 100 });
        cy.get('#config-minute').clear().type('3');
        cy.get('[data-testid="plugin-create-form-submit"]').click({ delay: 100 }).wait(2000);
        cy.get('[data-testid="status"]').should('contain', 'Enabled');
    });

    // test the route with plugins
    it('test the route without basic auth', () => {
        cy.request({
            method: 'GET',
            url: `${Cypress.env('routeHostUrl')}/get`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('message', 'Unauthorized');
        });
    });

    it('test the route with exceeding the rate limit', () => {
        cy.wait(1000 * 60); // wait for 1 minute to reset the rate limit counter
        for (let i = 1; i <= 4; i++) {
            cy.request({
                method: 'GET',
                url: `${Cypress.env('routeHostUrl')}/get`,
                auth: {
                    username: testData.username,
                    password: testData.password
                },
                failOnStatusCode: false
            }).then((resp) => {
                if (i < 4) {
                    expect(resp.status).to.eq(200);
                    expect(resp.headers['x-ratelimit-limit-minute']).to.include('3');
                    expect(resp.body.headers).to.have.property('X-Credential-Identifier', testData.username);
                } else {
                    cy.log(JSON.stringify(resp));
                    expect(resp.status).to.eq(429);
                    expect(resp.body).to.have.property('message', 'API rate limit exceeded');
                }
            });
        }
    });
});