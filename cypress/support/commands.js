// Command to delete all rows in an entity table
Cypress.Commands.add('deleteEntityTableRows',
    (entity) => {
        cy.visit(`${Cypress.env('managerPortalUrl')}/default/${entity}`).wait(2000);
        cy.get('body').then(($body) => {
            cy.log($body.find('table').length);
            if ($body.find('table').length === 0) {
                return;
            }
            cy.get('table tbody tr').then(($rows) => {
                if ($rows.length === 0) {
                    return;
                }
                cy.wrap($rows).each(($row) => {
                    cy.wrap($row).within(() => {
                        cy.get('[data-testid="row-actions-dropdown-trigger"]').click({ delay: 1000 });
                        cy.get('[data-testid="action-entity-delete"] > .dropdown-item-trigger-label').click({ delay: 1000 });
                    });
                    cy.get('.modal-container')
                        .should('be.visible')
                        .within(() => {
                            cy.get('.confirmation-text')
                                .invoke('text').then((text) => {
                                    cy.get('[data-testid="confirmation-input"]').type(text.slice(1, -1));
                                });
                            cy.contains('Yes, delete').click({ delay: 1000 });
                        });
                });
            });
        });
        cy.wait(1000);
    }
);