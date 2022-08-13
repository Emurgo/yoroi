import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'
import {expect} from 'chai'
import * as receiveScreen from '../screenObjects/receive.screen'
import {addressTextSelector, unusedAddressRows} from '../screenObjects/receive.screen'

export const checkTokenInAssets = async (tokenName) => {
  await walletHistoryScreen.assetsTabButton().click()
  await driver.waitUntil(async () => (await getAllAssets(walletHistoryScreen.assetItemSelector)).length > 0)
  expect(
    (await getAssetByName(tokenName, walletHistoryScreen.assetItemSelector, walletHistoryScreen.tokenNameSelector))
      .success,
    `The token "${tokenName} is not found in assets"`,
  ).to.be.true
}

export const getAllAssets = async (assetItemSelector: string) => {
  return await driver.$$(assetItemSelector)
}

export const getAssetByName = async (assetName: string, assetItemSelector: string, tokenNameSelector: string) => {
  const allAssetsComponents = await getAllAssets(assetItemSelector)
  for (const assetComponent of allAssetsComponents) {
    const assetComponentName = await assetComponent.$(tokenNameSelector).getText()
    if (assetComponentName == assetName) {
      return {success: true, component: assetComponent}
    }
  }
  return {success: false, component: null}
}

export const getReceiveAddress = async (): Promise<string> => {
  await walletHistoryScreen.receiveButton().click()
  await driver.waitUntil(async () => await receiveScreen.generateNewAddressButton().isDisplayed())
  // copy address
  const receiverAddress = await copyFirstUnusedAddress()
  // go back to the transactions screen
  await driver.back()
  return receiverAddress
}

export const copyFirstUnusedAddress = async (): Promise<string> => {
  return await unusedAddressRows().$(addressTextSelector).getText()
}
