import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'
import {expect} from 'chai'
import * as receiveScreen from '../screenObjects/receive.screen'
import {addressTextSelector, unusedAddressRows} from '../screenObjects/receive.screen'
import {amPmTo24, getPrettyDate} from '../helpers/utils'
import {getDateHeaders} from "../screenObjects/walletHistory.screen";

export const checkTokenInAssets = async (tokenName) => {
  await walletHistoryScreen.assetsTabButton().click()
  await driver.waitUntil(async () => (await getAllAssets(walletHistoryScreen.assetItemSelector)).length > 0)
  expect(
    (await getAssetByName(tokenName, walletHistoryScreen.assetItemSelector, walletHistoryScreen.tokenNameSelector))
      .success,
    `The token "${tokenName} is not found in assets"`,
  ).to.be.true
}

export const getAllAssets = async (assetItemSelector: string) => driver.$$(assetItemSelector)

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

export const copyFirstUnusedAddress = async (): Promise<string> => unusedAddressRows().$(addressTextSelector).getText()

export const getLatestTx = async (): Promise<WebdriverIO.Element> => {
  const allTxs = await walletHistoryScreen.getAllTransactions()
  return allTxs[0]
}

export const getLatestTxTime = async () => {
  const latestTx = await getLatestTx()
  const txTimeString = await latestTx.$(walletHistoryScreen.transactionTimeTextSelector).getText()
  const curDate = await getLatestDate()
  const convertedTime = amPmTo24(txTimeString)
  return Date.parse(`${curDate}T${convertedTime}`)
}

export const getLatestDate = async () => {
  const allDates = await getDateHeaders()
  const dateString = await allDates[0].getText()
  if (dateString == 'Today'){
    return getPrettyDate()
  }
  if (dateString == 'Yesterday'){
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return getPrettyDate(date)
  }
  return getPrettyDate(new Date(dateString))

}

export const waitForNewTransaction = async (latestTxISOTime: number, waitTime: number) => {
  const curTime = Date.now()
  while (curTime + waitTime > Date.now()) {
    const newLatestTxTime = await getLatestTxTime()
    if (newLatestTxTime > latestTxISOTime) {
      return true
    }
    await driver.pause(500)
  }
  return false
}
