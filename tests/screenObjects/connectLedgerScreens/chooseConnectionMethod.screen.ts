export const connectWithUSBButton = () => driver.$('//*[@resource-id="connectWithUSBButton"]')
export const connectWithBLEButton = () => driver.$('//*[@resource-id="connectWithBLEButton"]')

export const isDisplayed = async (): Promise<boolean> => {
  return (await connectWithUSBButton().isDisplayed()) && (await connectWithBLEButton().isDisplayed())
}
