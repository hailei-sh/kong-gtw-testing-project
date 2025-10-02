import './commands'

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Script error.') || err.message.includes('cross origin')) {
    return false
  }
})
