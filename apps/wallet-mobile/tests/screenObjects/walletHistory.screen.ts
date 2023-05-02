export const sendButton = () => driver.$('//*[@resource-id="sendButton"]')
export const receiveButton = () => driver.$('//*[@resource-id="receiveButton"]')
export const transactionsTabButton = () => driver.$('//*[@resource-id="transactionsTabButton"]')
export const assetsTabButton = () => driver.$('//*[@resource-id="assetsTabButton"]')
export const balanceText = () => driver.$('//*[@resource-id="balanceText"]')
export const pairedTotalText = () => driver.$('//*[@resource-id="pairedTotalText"]')

// transactions list
export const txsHistoryListComponent = () => driver.$('//*[@resource-id="txHistoryList"]')
export const txsEmptyHistoryComponent = () => driver.$('//*[@resource-id="emptyHistoryComponent"]')
export const txsDayHeaderTextSelector = '//*[@resource-id="dayHeaderText"]'
export const txHistoryListItemSelector = '//*[@resource-id="txHistoryListItem"]'
export const transactionDirectionTextSelector = '//*[@resource-id="transactionDirection"]'
export const transactionAmountComponentSelector = '//*[@resource-id="transactionAmount"]'
export const transactionTimeTextSelector = '//*[@resource-id="submittedAtText"]'
export const transactionTotalAssetsTextSelector = '//*[@resource-id="totalAssetsText"]'

// assets list
export const assetsListComponent = () => driver.$('//*[@resource-id="assetList"]')
export const assetItemSelector = '//*[@resource-id="assetItem"]'
export const tokenNameSelector = '//*[@resource-id="tokenInfoText"]'
export const tokenFingerPrintSelector = '//*[@resource-id="tokenFingerprintText"]'
export const tokenAmountSelector = '//*[@resource-id="tokenAmount"]'

export const isDisplayed = async () => {
  return (
    (await sendButton().isDisplayed()) &&
    (await receiveButton().isDisplayed()) &&
    (await transactionsTabButton().isDisplayed()) &&
    (await assetsTabButton().isDisplayed())
  )
}

export const getAllTransactions = async () => driver.$$(txHistoryListItemSelector)

export const getDateHeaders = async () => driver.$$(txsDayHeaderTextSelector)

export const isFullyLoaded = async () => {
  return (
    (await isDisplayed()) &&
    (await txsHistoryListComponent().isDisplayed()) &&
    ((await getAllTransactions()).length > 0)
  )
}
