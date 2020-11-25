// @flow
/* eslint-disable no-undef */
import {setupWallet} from './utils'

describe('Import a read-only wallet', () => {
  beforeAll(async () => {
    await device.reloadReactNative()
    await setupWallet()
  })

  it('should import a read-only wallet', async () => {
    await expect(element(by.id('addWalletOnHaskellShelleyButton'))).toBeVisible()
    await element(by.id('addWalletOnHaskellShelleyButton')).tap()
    await element(by.id('restoreWalletButton')).tap()
    await element(by.id('importReadOnlyWalletButton')).tap()
    await expect(element(by.id('saveReadOnlyWalletContainer'))).toBeVisible()
    await element(by.id('saveWalletButton')).tap()
    await expect(element(by.text('Available funds'))).toBeVisible()
  })
})
