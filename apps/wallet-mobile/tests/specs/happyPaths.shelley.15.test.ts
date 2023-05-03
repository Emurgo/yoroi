import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as nobodyLookingScreen from '../screenObjects/createWalletScreens/nobodyLookingNotification.screen'
import * as recoveryPhraseRememberScreen from '../screenObjects/createWalletScreens/recoveryPhraseRemember.screen'
import * as recoveryPhraseNotificationScreen from '../screenObjects/createWalletScreens/recoveryPhraseNotification.screen'
import * as recoveryPhraseEnterScreen from '../screenObjects/createWalletScreens/recoveryPhraseEnter.screen'
import * as myWalletsScreen from '../screenObjects/myWallets.screen'
import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'
import * as sendScreen from '../screenObjects/send.screen'
import * as selectWalletToRestoreScreen from '../screenObjects/selectWalletToRestore.screen'
import * as recoveryPhraseInputScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import * as verifyRestoredWalletScreen from '../screenObjects/restoreWalletsScreens/verifyRestoredWallet.screen'
import * as walletBottomPanel from '../screenObjects/walletBottomPanel.screen'
import * as stakingDashboard from '../screenObjects/stakingScreens/stakingDashboard.screen'
import * as stakingCenter from '../screenObjects/stakingScreens/stakingCenter.screen'
import * as confirmDelegationScreen from '../screenObjects/stakingScreens/confirmDelegating.screen'
import * as withdrawWarningScreen from '../screenObjects/stakingScreens/withdrawWarning.screen'
import * as confirmWithdrawTransactionScreen from '../screenObjects/stakingScreens/confirmWithdrawTransaction.screen'
import {
  WALLET_NAME,
  DEFAULT_TIMEOUT,
  DEFAULT_INTERVAL,
  VALID_PIN,
  NORMAL_15_WORD_WALLET,
  WalletType,
  SPENDING_PASSWORD,
  TADA_TOKEN,
  TWO_MINUTES_TIMEOUT,
  STAKE_POOL_ID,
} from '../constants'
import {
  checkForErrors,
  enterNewValue,
  getCoordinateByPercents,
  hideKeyboard,
  scroll,
} from '../screenFunctions/common.screenFunctions'
import {
  enterRecoveryPhrase,
  enterWalletCredentials,
  openWallet,
  repeatRecoveryPhrase,
} from '../screenFunctions/myWallet.screenFunctions'
import {
  checkTokenInAssets,
  getLatestTxTime,
  getReceiveAddress,
  waitForNewTransaction,
} from '../screenFunctions/walletHistory.screenFunctions'
import {prepareTransaction, balanceAndFeeIsCalculated} from '../screenFunctions/send.screenFunctions'
import {enterPinCodeIfNecessary} from '../screenFunctions/prepare.screenFunctions'
import {AssertionError} from 'chai'

const expect = require('chai').expect

describe('Happy paths', () => {
  describe('Creating a wallet', () => {
    it('Shelley era', async () => {
      await myWalletsScreen.addWalletTestnetButton().click()
      await addWalletScreen.createWalletButton().click()

      await driver.waitUntil(async () => await createNewWalletCredentialsScreen.credentialsView().isDisplayed())
      await enterWalletCredentials(WALLET_NAME)
      await hideKeyboard()
      await createNewWalletCredentialsScreen.continueButton().click()

      await nobodyLookingScreen.understandButton().click()

      const allWords = await recoveryPhraseRememberScreen.getAllWords()
      await recoveryPhraseRememberScreen.writtenItDownButton().click()

      await recoveryPhraseNotificationScreen.mySecretKeyOnDeviceCheckbox().click()
      await recoveryPhraseNotificationScreen.recoveringOnlyByPhraseCheckbox().click()
      await recoveryPhraseNotificationScreen.understandButton().click()

      await repeatRecoveryPhrase(allWords)
      await recoveryPhraseEnterScreen.confirmButton().click()

      await enterPinCodeIfNecessary(VALID_PIN)
      await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())

      expect(
        await driver.$(`[text="${WALLET_NAME}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
      ).to.be.true
    })
  })

  describe('Restored wallet', () => {
    it(`Restoring ${NORMAL_15_WORD_WALLET.name} wallet`, async () => {
      await myWalletsScreen.addWalletTestnetButton().click()
      await addWalletScreen.restoreWalletButton().click()

      if (NORMAL_15_WORD_WALLET.type == WalletType.NormalWallet) {
        await selectWalletToRestoreScreen.restoreNormalWalletButton().click()
      } else if (NORMAL_15_WORD_WALLET.type == WalletType.DaedalusWallet) {
        await selectWalletToRestoreScreen.restore24WordWalletButton().click()
      } else {
        throw Error(`Unknown wallet type: wallet type is ${NORMAL_15_WORD_WALLET.type}`)
      }
      await enterRecoveryPhrase(NORMAL_15_WORD_WALLET.phrase)
      await hideKeyboard()
      await recoveryPhraseInputScreen.restoreWalletButton().click()

      expect(await verifyRestoredWalletScreen.walletChecksumText().isDisplayed()).to.be.true
      expect(await verifyRestoredWalletScreen.walletChecksumText().getText()).to.be.equal(
        NORMAL_15_WORD_WALLET.checksum,
      )
      await verifyRestoredWalletScreen.continueButton().click()

      await driver.waitUntil(async () => await createNewWalletCredentialsScreen.credentialsView().isDisplayed())
      await enterWalletCredentials(NORMAL_15_WORD_WALLET.name)
      await createNewWalletCredentialsScreen.continueButton().click()

      await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())

      expect(
        await driver
          .$(`[text="${NORMAL_15_WORD_WALLET.name}"]`)
          .waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
        `The "${NORMAL_15_WORD_WALLET.name}" wasn't found`,
      ).to.be.true
    })

    it(`Intrawallet transaction, ${NORMAL_15_WORD_WALLET.name} wallet`, async () => {
      await openWallet(NORMAL_15_WORD_WALLET.name)
      const latestTxTime = await getLatestTxTime()
      const receiverAddress = await getReceiveAddress()
      await walletHistoryScreen.sendButton().click()
      await prepareTransaction(receiverAddress, TADA_TOKEN, '1')
      await driver.waitUntil(async () => await balanceAndFeeIsCalculated())
      await sendScreen.continueButton().click()
      await driver.waitUntil(async () => await sendScreen.confirmTxButton().isDisplayed())
      await enterNewValue(sendScreen.confirmSpendingPasswordInput, SPENDING_PASSWORD)
      await sendScreen.confirmTxButton().click()

      await checkForErrors()

      expect(
        await walletHistoryScreen.sendButton().waitForDisplayed({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
        `Wallet transactions screen is not displayed`,
      ).to.be.true

      try {
        await driver.waitUntil(async () => await waitForNewTransaction(latestTxTime, TWO_MINUTES_TIMEOUT))
      } catch (e) {
        throw new AssertionError('There is no new transaction')
      }
    })

    it(`Intrawallet transaction, ${NORMAL_15_WORD_WALLET.name} wallet, token`, async () => {
      const tokenName = 'wDOGE'
      await openWallet(NORMAL_15_WORD_WALLET.name)
      const latestTxTime = await getLatestTxTime()
      await checkTokenInAssets(tokenName)
      const receiverAddress = await getReceiveAddress()
      await walletHistoryScreen.sendButton().click()
      await prepareTransaction(receiverAddress, tokenName, '1')
      await driver.waitUntil(async () => await balanceAndFeeIsCalculated())
      await sendScreen.continueButton().click()
      await driver.waitUntil(async () => await sendScreen.confirmTxButton().isDisplayed())
      await enterNewValue(sendScreen.confirmSpendingPasswordInput, SPENDING_PASSWORD)
      await sendScreen.confirmTxButton().click()

      await checkForErrors()

      expect(
        await walletHistoryScreen.sendButton().waitForDisplayed({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
        `Wallet transactions screen is not displayed`,
      ).to.be.true

      try {
        await driver.waitUntil(async () => await waitForNewTransaction(latestTxTime, TWO_MINUTES_TIMEOUT))
      } catch (e) {
        throw new AssertionError('There is no new transaction')
      }
    })

    it(`Delegation, ${NORMAL_15_WORD_WALLET.name} wallet`, async () => {
      await openWallet(NORMAL_15_WORD_WALLET.name)
      const latestTxTime = await getLatestTxTime()

      await walletBottomPanel.stakingButton().click()
      await driver.waitUntil(async () => await stakingDashboard.isDisplayed())
      await stakingDashboard.goToStakingCenterButton().click()
      await enterNewValue(stakingCenter.nightlyPoolHashInput, STAKE_POOL_ID)
      await stakingCenter.nightlyDelegateButton().click()
      await driver.waitUntil(async () => await confirmDelegationScreen.isDisplayed())
      const stakePoolHash = await confirmDelegationScreen.stakePoolHashText().getText()
      expect(stakePoolHash).to.be.equal(STAKE_POOL_ID)
      await enterNewValue(confirmDelegationScreen.spendingPasswordInput, SPENDING_PASSWORD)
      await confirmDelegationScreen.confirmDelegationButton().click()

      await checkForErrors()

      try {
        await driver.waitUntil(async () => await waitForNewTransaction(latestTxTime, TWO_MINUTES_TIMEOUT + 60000))
      } catch (e) {
        throw new AssertionError('There is no new transaction')
      }

      await walletBottomPanel.stakingButton().click()
      await driver.waitUntil(async () => await stakingDashboard.isDisplayed())
      const availableFunds = await stakingDashboard.availableFundsText().getText()
      const totalDelegated = await stakingDashboard.userSummaryDelegatedText().getText()

      expect(availableFunds).to.be.equal(totalDelegated)
    })

    it(`Deregistering, ${NORMAL_15_WORD_WALLET.name} wallet`, async () => {
      await openWallet(NORMAL_15_WORD_WALLET.name)
      const latestTxTime = await getLatestTxTime()
      await walletBottomPanel.stakingButton().click()

      await driver.waitUntil(async () => await stakingDashboard.isDisplayed())
      const availableFunds = await stakingDashboard.availableFundsText().getText()
      const totalDelegated = await stakingDashboard.userSummaryDelegatedText().getText()
      expect(availableFunds).to.be.equal(totalDelegated)
      await stakingDashboard.userSummaryWithdrawButton().click()

      await driver.waitUntil(async () => await withdrawWarningScreen.isDisplayed())
      const [xPoint, yStartPoint] = await getCoordinateByPercents(50, 80)
      const [, yEndPoint] = await getCoordinateByPercents(50, 30)

      await scroll(await withdrawWarningScreen.warningView(), yStartPoint, yEndPoint, xPoint)

      await withdrawWarningScreen.iUnderstandCheckbox().click()
      await withdrawWarningScreen.deregisterButton().click()

      await driver.waitUntil(async () => await confirmWithdrawTransactionScreen.isDisplayed())
      const recoveredBalance = (await confirmWithdrawTransactionScreen.recoveredBalanceText().getText()).split(' ')[0]
      expect(parseFloat(recoveredBalance)).to.be.equal(2)
      await enterNewValue(confirmWithdrawTransactionScreen.walletPasswordInput, SPENDING_PASSWORD, false)

      const [, yStartPointTxScreen] = await getCoordinateByPercents(50, 40)
      const [, yEndPointTxScreen] = await getCoordinateByPercents(50, 10)

      await scroll(
        await confirmWithdrawTransactionScreen.confirmTxView(),
        yStartPointTxScreen,
        yEndPointTxScreen,
        xPoint,
      )
      await confirmWithdrawTransactionScreen.confirmTxButton().click()

      await checkForErrors()

      try {
        await driver.waitUntil(async () => await waitForNewTransaction(latestTxTime, TWO_MINUTES_TIMEOUT))
      } catch (e) {
        throw new AssertionError('There is no new transaction')
      }

      await walletBottomPanel.stakingButton().click()
      await driver.waitUntil(async () => await stakingDashboard.isDisplayed())
      expect(await stakingDashboard.notDelegatedImage().isDisplayed()).to.be.true
    })
  })
})
