// @flow
/* eslint-disable no-undef */

/**
 * hack to get text from element (feature not available in detox)
 *  see issue https://github.com/wix/detox/issues/445
 */
async function readTextValue(testID) {
  try {
    await expect(element(by.id(testID))).toHaveText('__read_element_error_')
    return ''
  } catch (error) {
    if (device.getPlatform() === 'ios') {
      const start = 'accessibilityLabel was "'
      const end = '" on '
      const errorMessage = error.message.toString()
      const [, restMessage] = errorMessage.split(start)
      const [label] = restMessage.split(end)
      return label
    } else {
      const start = 'Got:'
      const end = '}"'
      const errorMessage = error.message.toString()
      const [, restMessage] = errorMessage.split(start)
      const [label] = restMessage.split(end)
      const value = label.split(',')
      const combineText = value.find((i) => i.includes('text=')).trim()
      const [, elementText] = combineText.split('=')
      return elementText
    }
  }
}

describe('Setup a fresh wallet on Byron network', () => {
  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should create a new wallet called "test wallet"', async () => {
    await expect(element(by.text('English'))).toBeVisible()
    await element(by.id('chooseLangButton')).tap()
    await expect(element(by.id('acceptTosButton'))).toBeVisible()
    await expect(element(by.id('acceptTosCheckbox'))).toBeVisible()
    await element(by.id('acceptTosCheckbox')).tap()
    await element(by.id('acceptTosButton')).tap()
    await expect(element(by.id('customPinContainer'))).toBeVisible()
    await expect(element(by.id('pinKey0'))).toBeVisible()

    // set dummy pin
    await element(by.id('pinKey0')).tap()
    await element(by.id('pinKey1')).tap()
    await element(by.id('pinKey2')).tap()
    await element(by.id('pinKey3')).tap()
    await element(by.id('pinKey4')).tap()
    await element(by.id('pinKey5')).tap()
    await expect(element(by.id('pinKey0'))).toBeVisible()
    await element(by.id('pinKey0')).tap()
    await element(by.id('pinKey1')).tap()
    await element(by.id('pinKey2')).tap()
    await element(by.id('pinKey3')).tap()
    await element(by.id('pinKey4')).tap()
    await element(by.id('pinKey5')).tap()

    await expect(element(by.id('addWalletOnByronButton'))).toBeVisible()
    await element(by.id('addWalletOnByronButton')).tap()

    await expect(element(by.id('createWalletButton'))).toBeVisible()
    await element(by.id('addWalletOnByronButton')).tap()

    await expect(element(by.id('createWalletButton'))).toBeVisible()
    await element(by.id('walletNameInput')).typeText('test wallet')
    await element(by.id('walletPasswordInput')).typeText('abracadabra123')
    await element(by.id('walletRepeatPasswordInput')).typeText('abracadabra123')
    await element(by.id('walletFormContinueButton')).tap()

    await element(by.id('mnemonicExplanationModal')).tap()

    const mnemonic = []
    for (i = 0; i < 15; i++) {
      const word = await readTextValue(`mnemonic-${i}`)
      mnemonic.push(word)
    }
    await element(by.id('mnemonicShowScreen::confirm')).tap()

    await element(by.id('mnemonicBackupImportanceModal::checkBox1')).tap()
    await element(by.id('mnemonicBackupImportanceModal::checkBox2')).tap()
    await element(by.id('mnemonicBackupImportanceModal::confirm')).tap()

    for (i = 0; i < 15; i++) {
      await element(by.id(`wordBadgeNonTapped-${mnemonic[i]}`)).tap()
    }
    await element(by.id('mnemonicCheckScreen::confirm')).tap()
    await expect(element(by.text('test wallet'))).toBeVisible()
  })
})
