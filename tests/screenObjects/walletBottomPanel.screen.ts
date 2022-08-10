export const walletHistoryButton = () => driver.$('//*[@resource-id="walletTabBarButton"]')
export const stakingButton = () => driver.$('//*[@resource-id="stakingTabBarButton"]')
export const menuButton = () => driver.$('//*[@resource-id="menuTabBarButton"]')

export const isDisplayed = async () => {
  return (
    (await walletHistoryButton().isDisplayed()) &&
    (await stakingButton().isDisplayed()) &&
    (await menuButton().isDisplayed())
  )
}
