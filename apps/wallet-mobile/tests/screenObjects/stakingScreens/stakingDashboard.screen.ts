export const epochProgressTitleCard = () => driver.$('//*[@resource-id="epochProgressTitleCard"]')
export const userSummaryTitleCard = () => driver.$('//*[@resource-id="userSummaryTitleCard"]')
export const availableFundsText = () => driver.$('//*[@resource-id="userSummaryAvailableFundsText"]')
export const userSummaryRewardsText = () => driver.$('//*[@resource-id="userSummaryRewardsText"]')
export const userSummaryWithdrawButton = () => driver.$('//*[@resource-id="userSummaryWithdrawButton"]')
export const userSummaryDelegatedText = () => driver.$('//*[@resource-id="userSummaryDelegatedText"]')
export const stakePoolInfoTitleCard = () => driver.$('//*[@resource-id="stakePoolInfoTitleCard"]')
export const stakePoolInfoPoolIdText = () => driver.$('//*[@resource-id="stakePoolInfoPoolIdText"]')
export const stakePoolInfoPoolIdCopyButton = () => driver.$('//*[@resource-id="copyButton"]')
export const goToStakingCenterButton = () => driver.$('//*[@resource-id="stakingCenterButton"]')
export const notDelegatedImage = () => driver.$('//*[@resource-id="notDelegatedInfo"]')

export const isDisplayed = async () => {
  return (await epochProgressTitleCard().isDisplayed()) && (await userSummaryTitleCard().isDisplayed())
}
