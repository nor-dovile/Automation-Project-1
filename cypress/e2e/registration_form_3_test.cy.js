beforeEach(() => {
    cy.visit('cypress/fixtures/registration_form_3.html')
})

/*
BONUS TASK: add visual tests for registration form 3
Task list:
* Test suite for visual tests for registration form 3 is already created
* Create tests to verify visual parts of the page:
*/

describe('Section 1: Visual tests', () => {

  describe('Section: Email', () => {
    it('Error message should not be visible when entering a valid email format', () => {
      cy.get('[name="email"]').type('cerebrum@email.com')
      cy.get('[ng-show="myForm.email.$error.email"]').should('not.be.visible')
    })

    it('Error message should be visible when entering an invalid email format', () => {
        cy.get('[name="email"]').type('badEmailFormat')
        cy.get('[ng-show="myForm.email.$error.email"]').should('be.visible')
        cy.get('[ng-show="myForm.email.$error.email"]').contains('Invalid email address.')
      })
  })

  // * dropdown and dependencies between 2 dropdowns
  describe('Section: Selection of country and city', () => {
    it('Should select cities based on selected countries', () => {
        assertCountryWithExpectedCities('Spain', ['', 'string:Malaga', 'string:Madrid', 'string:Valencia', 'string:Corralejo'])
        assertCountryWithExpectedCities('Estonia', ['', 'string:Tallinn', 'string:Haapsalu', 'string:Tartu'])
        assertCountryWithExpectedCities('Austria', ['', 'string:Vienna', 'string:Salzburg', 'string:Innsbruck'])
      })
  })

  // * radio buttons and its content
  describe('Section: News letter frequency', () => {
    it('Check that radio button list is correct', () => {
        cy.get('input[type="radio"]').should('have.length', 4)

         // Verify labels of the radio buttons
        cy.get('input[type="radio"]').next().eq(0).should('have.text','Daily')
        cy.get('input[type="radio"]').next().eq(1).should('have.text','Weekly')
        cy.get('input[type="radio"]').next().eq(2).should('have.text','Monthly')
        cy.get('input[type="radio"]').next().eq(3).should('have.text','Never')

        //Verify default state of radio buttons
        cy.get('input[type="radio"]').eq(0).should('not.be.checked')
        cy.get('input[type="radio"]').eq(1).should('not.be.checked')
        cy.get('input[type="radio"]').eq(2).should('not.be.checked')
        cy.get('input[type="radio"]').eq(3).should('not.be.checked')

        // Selecting one will remove selection from other radio button
        cy.get('input[type="radio"]').eq(0).check().should('be.checked')
        cy.get('input[type="radio"]').eq(1).check().should('be.checked')
        cy.get('input[type="radio"]').eq(0).should('not.be.checked')    
    })
  })

  // * checkboxes, their content and links
  describe('Section: Policies', () => {
    it('Check that check boxes list is correct', () => {
      // Check that there are two policies
      cy.get('input[type="checkbox"]').should('have.length', 2)
 
      // Check Privacy policy checkbox and label
      cy.get('input[type="checkbox"]').eq(0).click()
      cy.get('input[type="checkbox"]').eq(0).should('be.checked')
      cy.get('input[type="checkbox"]').eq(0).parent().contains('Accept our privacy policy')

      // Check Cookie policy checkbox and label
      cy.get('input[type="checkbox"]').next().eq(0).click()
      cy.get('input[type="checkbox"]').next().eq(0).should('be.checked')
      cy.get('input[type="checkbox"]').eq(0).parent().contains('Accept our cookie policy')
    })
  })
})

function assertCountryWithExpectedCities(country, expectedCities) {
  cy.get('#country').select(country)
  cy.get('#city option').should('have.length', expectedCities.length)

  cy.get('#city').find('option').then(options => {
    const actual = [...options].map(option => option.value)
    expect(actual).to.deep.eq(expectedCities)
  })
}


/*
BONUS TASK: add functional tests for registration form 3
Task list:
* Create second test suite for functional tests
* Create tests to verify logic of the page:
    * all fields are filled in + validation
    * only mandatory fields are filled in + validations
    * mandatory fields are absent + validations (try using function)
    * If city is already chosen and country is updated, then city choice should be removed
    * add file (google yourself for solution)
 */
describe('Section 2: Functional tests', () => {

  describe('All fields are filled in + validation', () => {
    it('User can submit form with all fields added', () => {
      inputMandatoryData()

      // fill up not mandatory fields
      cy.get('#name').type('Jane')
      cy.get('input[type="date"]').eq(0).type('1962-12-02')
      cy.get('#birthday').type('1999-09-09')
      cy.get('input[type="checkbox"]').next().eq(0).click()
      cy.get('input[type="radio"]').check('Weekly')

      // Assert that submit query button is enabled and that form can be submited
      cy.get('input[type="submit"]').eq(1).should('be.enabled')
      cy.get('input[type="submit"]').eq(1).click()
      cy.contains('Submission received').should('be.visible')
    })
  })

  describe('Only mandatory fields are filled in + validations', () => {
    it('User can submit form with valid data and only mandatory fields added', () => {
      inputMandatoryData()

      // Assert that submit button is enabled
      cy.get('input[type="submit"]').eq(1).should('be.enabled')
      cy.get('input[type="submit"]').eq(1).click()

      // Assert that after submitting the form system show successful message
      cy.contains('Submission received').should('be.visible')
    })
  })

  describe('Mandatory fields are absent + validations', () => {
    it('User cannot submit the form without email', () => {
      inputMandatoryData()
      cy.get('[name="email"]').clear()
      cy.get('[ng-show="myForm.email.$error.required"]').should('be.visible').should('contain', 'Email is required.')
      cy.get('input[type="submit"]').eq(1).should('be.disabled')
    })
    
    it('User cannot submit the form without Country', () => {
      inputMandatoryData()
      cy.get('#country').select('')
      cy.get('input[type="submit"]').eq(1).should('be.disabled')
    })

    it('User cannot submit the form without City', () => {
      inputMandatoryData()
      cy.get('#city').select('')
      cy.get('input[type="submit"]').eq(1).should('be.disabled')
    })

    it('User cannot submit the form without accepting privacy policy', () => {
      inputMandatoryData()
      cy.get('input[type="checkbox"]').eq(0).click()
      cy.get('input[type="submit"]').eq(1).should('be.disabled')
    })
  })

  describe('If city is already chosen and country is updated, then city choice should be removed', () => {
    it('If city is already chosen and country is updated, then city choice should be removed', () => {
      cy.get('#country').select('Spain')
      cy.get('#city').select('Valencia')
      cy.get('#country').select('Estonia')
      cy.get('#city').should('not.contain', 'Valencia')
    })
  })

  describe('User can upload the file', () => {
    it('Upload the file', () => {
      cy.get('#myFile').selectFile('cypress/fixtures/cypress_logo.png')
      cy.get('#myFile').should('contain.value', 'cypress_logo.png')
    })
  })
})

function inputMandatoryData() {
  cy.get("input[name='email']").type('cerebrum@example.com')
  cy.get('#country').select('Spain')
  cy.get('#city').select('Valencia')
  cy.get('input[type="checkbox"]').eq(0).click()
}