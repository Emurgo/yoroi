import {enterPinCode} from '../helpers/utils'
import {VALID_PIN} from '../constants'
import * as tosScreen from '../screenObjects/tos.screen'
import * as chooseLanguageScreen from '../screenObjects/chooseLanguage.screen'
import * as alertScreen from '../screenObjects/alert.screen'
import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import {expect} from 'chai'

describe('First entrance', () => {
  // Execute a block of code before every tests
  beforeEach(() => {
    driver.launchApp()
  })
  // Execute a block of code after every tests
  afterEach(() => {
    driver.closeApp()
  })

  it('Accept ToS, enter incorrect PIN', async () => {
    await chooseLanguageScreen.chooseLanguageButton().click()
    await tosScreen.acceptToSCheckbox().click()
    await tosScreen.acceptToSButton().click()
    await enterPinCode(VALID_PIN)
    await enterPinCode('123455')
    expect(await alertScreen.title().isDisplayed()).to.be.true
    expect(await alertScreen.message().isDisplayed()).to.be.true
    expect(await alertScreen.title().getText()).to.be.equal('Invalid PIN')
    expect(await alertScreen.message().getText()).to.be.equal('PINs do not match.')
  })

  it('Accept ToS, enter correct PIN', async () => {
    await chooseLanguageScreen.chooseLanguageButton().click()
    await tosScreen.acceptToSCheckbox().click()
    await tosScreen.acceptToSButton().click()
    await enterPinCode(VALID_PIN)
    await enterPinCode(VALID_PIN)
    expect(await addWalletsScreen.isDisplayed()).to.be.true
  })
})
