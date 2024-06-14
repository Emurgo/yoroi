/* eslint-disable @typescript-eslint/no-explicit-any */
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {PleaseWaitModal, Spacer} from '../../../components'
import {features} from '../../../features'
import {useSelectedWallet} from '../../../features/WalletManager/context/SelectedWalletContext'
import {showErrorDialog} from '../../../kernel/dialogs'
import {isDev, isNightly} from '../../../kernel/env'
import {useLanguage} from '../../../kernel/i18n'
import globalMessages from '../../../kernel/i18n/global-messages'
import {logger} from '../../../kernel/logger/logger'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {StakingCenterRouteNavigation} from '../../../kernel/navigation'
import {NETWORKS} from '../../../yoroi-wallets/cardano/networks'
import {NotEnoughMoneyToSendError} from '../../../yoroi-wallets/cardano/types'
import {usePlate} from '../../../yoroi-wallets/hooks'
import {useStakingTx} from '../../Dashboard/StakePoolInfos'
import {PoolDetailScreen} from '../PoolDetails'

export const StakingCenter = () => {
  const intl = useIntl()
  const navigation = useNavigation<StakingCenterRouteNavigation>()

  const {languageCode} = useLanguage()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()
  const plate = usePlate({networkId: wallet.networkId, publicKeyHex: wallet.publicKeyHex})
  useFocusEffect(
    React.useCallback(() => {
      track.stakingCenterPageViewed()
    }, [track]),
  )

  const [selectedPoolId, setSelectedPoolId] = React.useState<string>()

  const {isLoading} = useStakingTx(
    {wallet, poolId: selectedPoolId},
    {
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

  return (
    <>
      {(isDev || (isNightly && !wallet.isMainnet)) && (
        <View style={{flex: 1}}>
          <PoolDetailScreen onPressDelegate={setSelectedPoolId} />
        </View>
      )}

      {(wallet.isMainnet || features.showProdPoolsInDev) && (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
          <Spacer height={8} />

          <WebView
            originWhitelist={['*']}
            androidLayerType="software"
            source={{uri: prepareStakingURL(languageCode, plate.accountPlate.TextPart)}}
            onMessage={(event) => handleOnMessage(event)}
          />
        </View>
      )}

      <PleaseWaitModal title="" spinnerText={intl.formatMessage(globalMessages.pleaseWait)} visible={isLoading} />
    </>
  )
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
