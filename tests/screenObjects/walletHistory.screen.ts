export const sendButton = () => driver.$('//*[@resource-id="sendButton"]')
export const receiveButton = () => driver.$('//*[@resource-id="receiveButton"]')
export const backButton = () => driver.$('//*[@content-desc="wallet-selection, back"]')

export const isDisplayed = async () => {
  return (await sendButton().isDisplayed) && (await receiveButton().isDisplayed)
}
