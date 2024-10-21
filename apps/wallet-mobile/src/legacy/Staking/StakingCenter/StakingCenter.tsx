import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {WebView, WebViewMessageEvent} from 'react-native-webview'
import {useQueryClient} from 'react-query'

import {PleaseWaitModal} from '../../../components/PleaseWaitModal'
import {Spacer} from '../../../components/Spacer/Spacer'
import {DelegateStakeOperation, RegisterStakingKeyOperation} from '../../../features/ReviewTx/common/operations'
import {useReviewTx} from '../../../features/ReviewTx/common/ReviewTxProvider'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../features/WalletManager/context/WalletManagerProvider'
import {showErrorDialog} from '../../../kernel/dialogs'
import {useLanguage} from '../../../kernel/i18n'
import globalMessages from '../../../kernel/i18n/global-messages'
import {logger} from '../../../kernel/logger/logger'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {StakingCenterRouteNavigation, useWalletNavigation} from '../../../kernel/navigation'
import {NotEnoughMoneyToSendError} from '../../../yoroi-wallets/cardano/types'
import {useStakingInfo, useStakingTx} from '../../Dashboard/StakePoolInfos'
import {PoolDetailScreen} from '../PoolDetails'

export const StakingCenter = () => {
  const intl = useIntl()
  const navigation = useNavigation<StakingCenterRouteNavigation>()
  const {isDark} = useTheme()
  const {styles} = useStyles()
  const queryClient = useQueryClient()

  const {languageCode} = useLanguage()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {track} = useMetrics()
  const {plate} = walletManager.checksum(wallet.publicKeyHex)
  const {navigateToTxReview, resetToTxHistory} = useWalletNavigation()
  const {unsignedTxChanged, onSuccessChanged, onErrorChanged, operationsChanged} = useReviewTx()
  const stakingInfo = useStakingInfo(wallet, {suspense: true})
  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'

  useFocusEffect(
    React.useCallback(() => {
      track.stakingCenterPageViewed()
    }, [track]),
  )

  const [selectedPoolId, setSelectedPoolId] = React.useState<string | null>(null)
  const [isContentLoaded, setIsContentLoaded] = React.useState(false)

  const {isLoading} = useStakingTx(
    {wallet, poolId: selectedPoolId ?? undefined, meta},
    {
      enabled: selectedPoolId != null,
      suspense: false,
      onSuccess: (yoroiUnsignedTx) => {
        if (selectedPoolId == null) return

        let operations = [<DelegateStakeOperation poolId={selectedPoolId} key="0" />]
        if (!hasStakingKeyRegistered) operations = [<RegisterStakingKeyOperation key="-1" />, ...operations]

        operationsChanged(operations)
        unsignedTxChanged(yoroiUnsignedTx)
        onSuccessChanged(() => {
          queryClient.resetQueries([wallet.id, 'stakingInfo'])
          resetToTxHistory()
        })
        onErrorChanged(() => navigation.navigate('delegation-failed-tx'))
        navigateToTxReview()
      },
      onError: (error) => {
        if (error instanceof NotEnoughMoneyToSendError) {
          navigation.navigate('delegation-failed-tx')
        } else {
          logger.error(error as Error)
          navigation.navigate('delegation-failed-tx')
        }
      },
    },
  )

  const handleOnMessage = async (event: WebViewMessageEvent) => {
    const selectedPoolHashes = JSON.parse(decodeURI(event.nativeEvent.data))
    if (!Array.isArray(selectedPoolHashes) || selectedPoolHashes.length < 1) {
      await showErrorDialog(noPoolDataDialog, intl)
    }
    logger.debug('selected pools from explorer:', selectedPoolHashes)
    setSelectedPoolId(selectedPoolHashes[0])
  }

  const shouldDisplayPoolIDInput = !wallet.isMainnet
  const shouldDisplayPoolList = wallet.isMainnet

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.root}>
      {shouldDisplayPoolIDInput && <PoolDetailScreen onPressDelegate={setSelectedPoolId} />}

      {shouldDisplayPoolList && (
        <View style={styles.poolList}>
          <Spacer height={8} />

          <WebView
            style={{opacity: isContentLoaded ? 1 : 0}}
            originWhitelist={['*']}
            androidLayerType="software"
            source={{uri: prepareStakingURL(languageCode, plate)}}
            onMessage={(event) => handleOnMessage(event)}
            onLoadEnd={() => setTimeout(() => setIsContentLoaded(true), 250)}
            {...(isDark && {
              injectedJavaScript: `
              document.documentElement.style.overscrollBehavior = 'none'
              document.body.style.backgroundColor = "#222"
              document.body.style.filter = "invert(0.9) hue-rotate(180deg)"
              document.body.style.caretColor = "#FFFFFF"
              setTimeout(() =>
                [...document.images].forEach(i => i.style = 'filter:invert(1) hue-rotate(180deg)')
              , 1000)
            `,
            })}
          />
        </View>
      )}

      <PleaseWaitModal title="" spinnerText={intl.formatMessage(globalMessages.pleaseWait)} visible={isLoading} />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    poolList: {
      ...atoms.flex_1,
    },
  })
  return {styles}
}

const noPoolDataDialog = defineMessages({
  title: {
    id: 'components.stakingcenter.noPoolDataDialog.title',
    defaultMessage: '!!!Invalid Pool Data',
  },
  message: {
    id: 'components.stakingcenter.noPoolDataDialog.message',
    defaultMessage: '!!!The data from the stake pool(s) you selected is invalid. Please try again',
  },
})

const prepareStakingURL = (locale: string, plate: string): string => {
  // source=mobile is constant and already included
  let finalURL = 'https://adapools.yoroiwallet.com/?source=mobile'

  const lang = locale.slice(0, 2)
  finalURL += `&lang=${lang}`

  finalURL += `&bias=${plate}`

  return finalURL
}
