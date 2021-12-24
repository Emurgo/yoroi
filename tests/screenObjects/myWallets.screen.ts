export const pageTitle = () => driver.$('[text="My wallets"]')
export const addWalletButton = () => driver.$('//*[@resource-id="addWalletOnHaskellShelleyButton"]')
export const addWalletByronButton = () => driver.$('//*[@resource-id="addWalletOnByronButton"]')
export const addWalletTestnetButton = () => driver.$('[text="ADD WALLET ON TESTNET (SHELLEY-ERA)"]')
export const isDisplayed = () => {
  driver.setImplicitTimeout(500)
  return pageTitle().isDisplayed()
}
