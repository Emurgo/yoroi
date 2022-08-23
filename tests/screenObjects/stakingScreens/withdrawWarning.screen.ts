export const warningView = () => driver.$('//*[@resource-id="dangerousActionView"]')
export const iUnderstandCheckbox = () => driver.$('//*[@resource-id="dangerousActionCheckbox"]')
export const keepRegisteredButton = () => driver.$('//*[@resource-id="keepRegisteredButton"]')
export const deregisterButton = () => driver.$('//*[@resource-id="deregisterButton"]')

export const isDisplayed = async () => {
  return await warningView().isDisplayed()
}
