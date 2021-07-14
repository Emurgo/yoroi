// @flow
/* eslint-disable no-undef */
import {setupWallet, readTextValue} from './utils'

describe('Setup a fresh wallet on Byron network', () => {
  beforeEach(async () => {
    await device.reloadReactNative()
    await setupWallet()
  })

  it('should create a new wallet called "test wallet"', async () => {
    await expect(element(by.id('addWalletOnByronButton'))).toBeVisible()
    await element(by.id('addWalletOnByronButton')).tap()

    await expect(element(by.id('createWalletButton'))).toBeVisible()
    await element(by.id('createWalletButton')).tap()

    await element(by.id('walletNameInput')).typeText('test wallet')
    await element(by.id('walletPasswordInput')).typeText('abracadabra123')
    await element(by.id('walletRepeatPasswordInput')).typeText('abracadabra123')

    await element(by.id('walletFormContinueButton')).tap()
    await element(by.id('mnemonicExplanationModal')).tap()

    const mnemonic = []
    for (let i = 0; i < 15; i++) {
      const word = await readTextValue(`mnemonic-${i}`)
      mnemonic.push(word)
    }
    await element(by.id('mnemonicShowScreen::confirm')).tap()

    await element(by.id('mnemonicBackupImportanceModal::checkBox1')).tap()
    await element(by.id('mnemonicBackupImportanceModal::checkBox2')).tap()
    await element(by.id('mnemonicBackupImportanceModal::confirm')).tap()

    for (let i = 0; i < 15; i++) {
      await element(by.id(`wordBadgeNonTapped-${mnemonic[i]}`)).tap()
    }
    await element(by.id('mnemonicCheckScreen::confirm')).tap()
    await expect(element(by.text('Available funds'))).toBeVisible()
  })
})
