/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {PleaseWaitModal, Spacer} from '../../components'
import {useStakingTx} from '../../Dashboard/StakePoolInfos'
import {showErrorDialog} from '../../dialogs'
import {useLanguage} from '../../i18n'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {CONFIG, isNightly, SHOW_PROD_POOLS_IN_DEV} from '../../legacy/config'
import {Logger} from '../../legacy/logging'
import {getNetworkConfigById} from '../../legacy/networks'
import {StakingCenterRouteNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {NotEnoughMoneyToSendError} from '../../yoroi-wallets'
import {PoolDetailScreen} from '../PoolDetails'

export const StakingCenter = () => {
  const intl = useIntl()
  const navigation = useNavigation<StakingCenterRouteNavigation>()

  const {languageCode} = useLanguage()
  const wallet = useSelectedWallet()

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
          showErrorDialog(errorMessages.insufficientBalance, intl)
        } else {
          Logger.error(error as any)
          showErrorDialog(errorMessages.generalError, intl, {
            message: error.message,
          })
        }
      },
    },
  )

  const handleOnMessage = async (event: WebViewMessageEvent) => {
    const selectedPoolHashes = JSON.parse(decodeURI(event.nativeEvent.data))
    if (!Array.isArray(selectedPoolHashes) || selectedPoolHashes.length < 1) {
      await showErrorDialog(noPoolDataDialog, intl)
    }
    Logger.debug('selected pools from explorer:', selectedPoolHashes)
    setSelectedPoolId(selectedPoolHashes[0])
  }

  const config = getNetworkConfigById(wallet.networkId)

  return (
    <>
      {(__DEV__ || (isNightly() && !config.IS_MAINNET)) && (
        <View style={{flex: 1}}>
          <PoolDetailScreen onPressDelegate={setSelectedPoolId} />
        </View>
      )}

      {(config.IS_MAINNET || SHOW_PROD_POOLS_IN_DEV) && (
        <>
          <View style={{flex: 1, backgroundColor: '#fff'}}>
            <Spacer height={8} />

            <WebView
              androidLayerType="software"
              source={{uri: prepareStakingURL(languageCode)}}
              onMessage={(event) => handleOnMessage(event)}
            />
          </View>

          <PleaseWaitModal title="" spinnerText={intl.formatMessage(globalMessages.pleaseWait)} visible={isLoading} />
        </>
      )}
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
const prepareStakingURL = (locale: string): string => {
  // source=mobile is constant and already included
  let finalURL = CONFIG.NETWORKS.HASKELL_SHELLEY.POOL_EXPLORER

  const lang = locale.slice(0, 2)
  finalURL += `&lang=${lang}`

  return finalURL
}
