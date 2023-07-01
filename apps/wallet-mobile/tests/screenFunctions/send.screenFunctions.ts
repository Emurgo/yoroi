import * as sendScreen from '../screenObjects/send.screen'
import {enterNewValue} from './common.screenFunctions'
import {getAssetByName} from './walletHistory.screenFunctions'
import {ADA_TOKEN, TADA_TOKEN} from '../constants'
import {expect} from 'chai'
import {getAmountFromString} from '../helpers/utils'

export const prepareTransaction = async (receiverAddress: string, tokenName: string, amount: string): Promise<void> => {
  // input receiver address
  await enterNewValue(sendScreen.receiverAddressInput, receiverAddress)
  if (tokenName !== ADA_TOKEN && tokenName !== TADA_TOKEN) {
    await selectTokenForTransaction(tokenName)
  }
  // input amount
  await enterNewValue(sendScreen.amountInput, amount)
}

export const selectTokenForTransaction = async (tokenName: string): Promise<void> => {
  await sendScreen.selectAssetButton().click()
  await driver.waitUntil(async () => await sendScreen.assetsListComponent().isDisplayed())
  const token = await getAssetByName(tokenName, sendScreen.assetItemSelector, sendScreen.tokenNameSelector)
  expect(token.success).to.be.true
  const tokenComponent = token.component
  await tokenComponent?.click()
  await driver.waitUntil(async () => await sendScreen.amountInput().isDisplayed())
}

export const balanceAndFeeIsCalculated = async (): Promise<boolean> => {
  const balanceAfterTxString = await sendScreen.balanceAfterText().getText()
  const feeString = await sendScreen.feesText().getText()
  const cleanedBalance = getAmountFromString(balanceAfterTxString)
  const cleanedFee = getAmountFromString(feeString)
  return cleanedBalance !== '-' && cleanedFee !== '-'
}
