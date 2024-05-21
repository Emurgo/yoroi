import {expect} from 'detox'
import fs from 'fs/promises'
import {addAttach, addMsg} from 'jest-html-reporters/helper'
import yargs from 'yargs/yargs'

import {mnemonicBadgeByWord, mnemonicByIndexText} from '../screens/createWalletFlow.screen'
import * as initialScreen from '../screens/initialScreen.screen'
import {pinKeyButton} from '../screens/pinCode.screen'
import {mnemonicByIndexInput} from '../screens/restoreWalletFlow.screen'
import * as userInsightScreen from '../screens/shareUserInsights.screen'

export const enterPIN = async (pin: string): Promise<void> => {
 for (const pinNumber of pin) {
  await pinKeyButton(pinNumber).tap()
 }
}

export const getSeedPhrase = async (): Promise<Array<string>> => {
 const allWords: Array<string | any> = []
 for (let i = 0; i < 15; i++) {
  const elementAttrs = await mnemonicByIndexText(i).getAttributes()
  // https://github.com/wix/Detox/issues/3179#issuecomment-1016420709
  if (!('elements' in elementAttrs)) {
   allWords.push(elementAttrs.text)
  }
 }
 return allWords
}

export const repeatSeedPhrase = async (phraseArray: string[]): Promise<void> => {
 for (const phraseArrayWord of phraseArray) {
  await mnemonicBadgeByWord(phraseArrayWord).tap()
 }
}

export const enterRecoveryPhrase = async (phraseArray: string[], platform: string): Promise<void> => {
 for (let wordIndex = 0; wordIndex < phraseArray.length; wordIndex++) {
  const wordElementInput = mnemonicByIndexInput(wordIndex, platform)
  await wordElementInput.typeText(`${phraseArray[wordIndex]}\n`)
 }
}

export const prepareApp = async (pin: string): Promise<void> => {
 await expect(element(by.text('Select language'))).toBeVisible()
 await expect(initialScreen.dropDownLanguagePicker()).toBeVisible()
 await initialScreen.checkboxSelect().tap({x: 5, y: 10})
 await initialScreen.buttonContinue().tap()

 await expect(userInsightScreen.txt_PageTitle()).toBeVisible()
 await userInsightScreen.btn_Accept().tap()

 await expect(pinKeyButton('1')).toBeVisible()
 await enterPIN(pin)
 await enterPIN(pin)
}

export const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

// deciding  from the args of the script (example  - e2e:test:android:nightly:release)
// checking the e2e path (example -  $npm_package_e2ePath_android) and decide if the test platform is android or iOS based on the folder path
export const initialize = async (): Promise<object> => {
 const argv = await parser.argv
 const platform = argv._[0].includes('android') ? 'android' : 'ios'
 console.log('Platform Name :', platform)
 return {platform}
}

// utility to parse the arguments in the script of package.json
// For detox script the '_' holds the test folder path (example - ./e2e/tests/_android) passed in the script as (example  - e2e:test:android:nightly:release)
export const parser = yargs(process.argv.slice(2)).options({
 _: {type: 'string', default: 'ios'},
})

// wrap device.disableSynchronization for android only
export const disableDeviceSync = async (platform: string) => {
 platform === 'android' && (await device.disableSynchronization())
}

// wrap device.enableSynchronization for android only
export const enableDeviceSync = async (platform: string) => {
 platform === 'android' && (await device.enableSynchronization())
}

export const takeScreenshot = async (description: string) => {
 const tmpPath = await device.takeScreenshot(description)
 await addAttach({
  attach: await fs.readFile(tmpPath),
  description: description,
  context: '',
  bufferFormat: 'png',
 })
}

export const addMsgToReport = async (msg: string) => {
 await addMsg({message: msg, context: null})
}

export const toBase64 = async (fileType: string, filePath: string) => {
 const base64String = await fs.readFile(filePath, {
  encoding: 'base64',
 })
 const withPrefix = `data:image/${fileType};base64,` + base64String
 return withPrefix
}
