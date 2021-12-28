export const addWalletButton = () => driver.$('//*[@resource-id="addWalletOnHaskellShelleyButton"]')
export const addWalletByronButton = () => driver.$('//*[@resource-id="addWalletOnByronButton"]')
export const addWalletTestnetButton = () => driver.$('[text="ADD WALLET ON TESTNET (SHELLEY-ERA)"]')
export const isDisplayed = () => {
  driver.setImplicitTimeout(400)
  return addWalletButton().isDisplayed()
}
