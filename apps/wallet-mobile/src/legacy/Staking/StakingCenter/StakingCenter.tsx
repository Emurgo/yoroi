/* eslint-disable @typescript-eslint/no-explicit-any */
import {walletChecksum} from '@emurgo/cip4-js'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {PleaseWaitModal, Spacer} from '../../../components'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {showErrorDialog} from '../../../kernel/dialogs'
import {useLanguage} from '../../../kernel/i18n'
import globalMessages from '../../../kernel/i18n/global-messages'
import {logger} from '../../../kernel/logger/logger'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {StakingCenterRouteNavigation} from '../../../kernel/navigation'
import {NETWORKS} from '../../../yoroi-wallets/cardano/networks'
import {NotEnoughMoneyToSendError} from '../../../yoroi-wallets/cardano/types'
import {useStakingTx} from '../../Dashboard/StakePoolInfos'
import {PoolDetailScreen} from '../PoolDetails'

export const StakingCenter = () => {
  const intl = useIntl()
  const navigation = useNavigation<StakingCenterRouteNavigation>()
  const {isDark} = useTheme()
  const {styles} = useStyles()

  const {languageCode} = useLanguage()
  const {wallet, meta} = useSelectedWallet()
  const {track} = useMetrics()
  const plate = walletChecksum(wallet.publicKeyHex)
  useFocusEffect(
    React.useCallback(() => {
      track.stakingCenterPageViewed()
    }, [track]),
  )

  const [selectedPoolId, setSelectedPoolId] = React.useState<string | null>(null)

  const {isLoading} = useStakingTx(
    {wallet, poolId: selectedPoolId ?? undefined, meta},
    {
      enabled: selectedPoolId != null,
      suspense: false,
      onSuccess: (yoroiUnsignedTx) => {
        if (selectedPoolId == null) return

        navigation.navigate('delegation-confirmation', {
          poolId: selectedPoolId,
          yoroiUnsignedTx,
        })
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
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.root}>
      {shouldDisplayPoolIDInput && <PoolDetailScreen onPressDelegate={setSelectedPoolId} />}

      {shouldDisplayPoolList && (
        <View style={styles.poolList}>
          <Spacer height={8} />

          <WebView
            originWhitelist={['*']}
            androidLayerType="software"
            source={{uri: prepareStakingURL(languageCode, plate.TextPart)}}
            onMessage={(event) => handleOnMessage(event)}
            {...(isDark && {
              injectedJavaScript: `
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
      flex: 1,
      backgroundColor: color.bg_color_high,
      ...atoms.px_lg,
    },
    poolList: {
      flex: 1,
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

/**
 * Prepares WebView's target staking URI
 * @param {*} poolList : Array of delegated pool hash
 */
const prepareStakingURL = (locale: string, plate: string): string => {
  // source=mobile is constant and already included
  let finalURL = NETWORKS.HASKELL_SHELLEY.POOL_EXPLORER

  const lang = locale.slice(0, 2)
  finalURL += `&lang=${lang}`

  finalURL += `&bias=${plate}`

  return finalURL
}
