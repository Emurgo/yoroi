import * as errorModal from '../screenObjects/errorModal.screen'
import {DEFAULT_INTERVAL, DEFAULT_TIMEOUT} from '../constants'
import {expect} from 'chai'

export async function checkForErrors(): Promise<void> {
  let isErrorDisplayed
  try {
    isErrorDisplayed = await errorModal
      .errorView()
      .waitForDisplayed({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL})
  } catch (e) {
    // nothing to do, an error didn't appear
    isErrorDisplayed = false
  }

  if (isErrorDisplayed) {
    await errorModal.showErrorMessageButton().click()
    await driver.pause(200)
    expect(isErrorDisplayed, 'An error appeared').to.be.false
  }
}

export const enterNewValue = async (screenElement: any, newValue: string): Promise<void> => {
  await screenElement().clearValue()
  await screenElement().addValue(newValue)
  await hideKeyboard()
}

export const hideKeyboard = async (): Promise<void> => {
  await driver.hideKeyboard('pressKey', 'Done')
}
