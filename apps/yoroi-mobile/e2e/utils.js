// @flow
/* eslint-disable no-undef */

/**
 * hack to get text from element (feature not available in detox)
 *  see issue https://github.com/wix/detox/issues/445
 */
export async function readTextValue(testID: string) {
  try {
    await expect(element(by.id(testID))).toHaveText('__read_element_error_')
    return ''
  } catch (error) {
    if (device.getPlatform() === 'ios') {
      const start = `AX.id='${testID}';`
      const end = '; AX.frame'
      const errorMessage = error.message.toString()
      const [, restMessage] = errorMessage.split(start)
      const [label] = restMessage.split(end)
      const [, value] = label.split('=')
      return value.slice(1, value.length - 1)
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

export const setupWallet = async () => {
  await element(by.id('chooseLangButton')).tap()
  await element(by.id('acceptTosCheckbox')).tap()
  await element(by.id('acceptTosButton')).tap()

  // set dummy pin
  await element(by.id('pinKey0')).tap()
  await element(by.id('pinKey1')).tap()
  await element(by.id('pinKey2')).tap()
  await element(by.id('pinKey3')).tap()
  await element(by.id('pinKey4')).tap()
  await element(by.id('pinKey5')).tap()
  await element(by.id('pinKey0')).tap()
  await element(by.id('pinKey1')).tap()
  await element(by.id('pinKey2')).tap()
  await element(by.id('pinKey3')).tap()
  await element(by.id('pinKey4')).tap()
  await element(by.id('pinKey5')).tap()
}
