export const errorView = () => driver.$('//*[@resource-id="errorView"]')
export const showErrorMessageButton = () => driver.$('//*[@resource-id="showErrorLogsButton"]')
export const closeErrorViewButton = () => driver.$('//*[@resource-id="closeErrorModalButton"]')

export const isDisplayed = async () => await errorView().isDisplayed()