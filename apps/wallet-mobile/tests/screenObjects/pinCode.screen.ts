export const getPinKey = (pinNumber: string) => driver.$(`//*[@resource-id="pinKey${pinNumber}"]`)
export const backspaceButton = () => driver.$('//*[@resource-id="pinKey⌫"]')
