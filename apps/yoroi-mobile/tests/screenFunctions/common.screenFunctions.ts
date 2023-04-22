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

export const enterNewValue = async (screenElement: any, newValue: string, hide: boolean = true): Promise<void> => {
  await screenElement().clearValue()
  await screenElement().addValue(newValue)
  if (hide) {
    await hideKeyboard()
  }
}

export const hideKeyboard = async (): Promise<void> => {
  await driver.hideKeyboard('pressKey', 'Done')
}

export const scroll = async (
  scrollViewComponent: WebdriverIO.Element,
  yStartPoint: number,
  yEndPoint: number,
  xPoint: number,
): Promise<void> => {
  await scrollViewComponent.touchAction([
    {
      action: 'press',
      x: xPoint,
      y: yStartPoint,
    },
    {
      action: 'wait',
      ms: 200,
    },
    {
      action: 'moveTo',
      x: xPoint,
      y: yEndPoint,
    },
    'release',
  ])
}

export const getCoordinateByPercents = async (
  xPointPercentage: number,
  yPointPercentage: number,
): Promise<[number, number]> => {
  const {width, height} = await driver.getWindowSize()
  const xPoint = (width * xPointPercentage) / 100
  const yPoint = (height * yPointPercentage) / 100
  return [xPoint, yPoint]
}
