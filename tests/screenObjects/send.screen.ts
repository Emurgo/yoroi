export const receiverAddressInput = () => driver.$('//*[@resource-id="addressInput"]').$('android.widget.EditText')
export const amountInput = () => driver.$('//*[@resource-id="amountFieldInput"]').$('android.widget.EditText')
export const sendAllCheckbox = () => driver.$('//*[@resource-id="sendAllCheckbox"]')
export const continueButton = () => driver.$('//*[@resource-id="continueButton"]')