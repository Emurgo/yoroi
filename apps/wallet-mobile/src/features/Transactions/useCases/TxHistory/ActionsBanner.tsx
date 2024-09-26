import {useNavigation} from '@react-navigation/native'
import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Chain} from '@yoroi/types'
import React from 'react'
import {GestureResponderEvent, StyleSheet, TouchableOpacity, View} from 'react-native'

import {useCopy} from '../../../../components/Clipboard/ClipboardProvider'
import {Icon} from '../../../../components/Icon'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../kernel/navigation'
import {useReceive} from '../../../Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '../../../Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '../../../Receive/common/useReceiveAddressesStatus'
import {useSwapForm} from '../../../Swap/common/SwapFormProvider'
import {useAddressMode} from '../../../WalletManager/common/hooks/useAddressMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../common/strings'

export const ActionsBanner = ({disabled = false}: {disabled: boolean}) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const {isSingle, addressMode} = useAddressMode()
  const {next: nextReceiveAddress, used: usedAddresses} = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const {copy} = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} = useMultipleAddressesInfo()

  const {reset: resetSendState} = useTransfer()
  const {orderData} = useSwap()
  const {resetSwapForm} = useSwapForm()

  const {track} = useMetrics()

  const {
    selected: {network},
  } = useWalletManager()

  const {
    meta,
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()

  const handleOnSend = () => {
    navigateTo.send()
    resetSendState()
  }

  const handleOnSwap = () => {
    if (network === Chain.Network.Preprod) {
      navigateTo.swapPreprodNotice()
      return
    }

    if (network === Chain.Network.Sancho) {
      navigateTo.swapSanchoNotice()
      return
    }

    resetSwapForm()

    track.swapInitiated({
      from_asset: [
        {asset_name: portfolioPrimaryTokenInfo.name, asset_ticker: portfolioPrimaryTokenInfo.ticker, policy_id: ''},
      ],
      to_asset: [{asset_name: '', asset_ticker: '', policy_id: ''}],
      order_type: orderData.type,
      slippage_tolerance: orderData.slippage,
    })

    navigateTo.swap()
  }

  const handleOnExchange = () => {
    track.walletPageExchangeClicked()
    navigateTo.exchange()
  }

  const handleOnPressReceive = () => {
    if (!isSingle) {
      navigateTo.receiveMultipleAddresses()
      return
    }

    if (usedAddresses.length <= 1 && isShowingMultipleAddressInfo) {
      hideMultipleAddressesInfo({
        onSuccess: () => {
          selectedAddressChanged(nextReceiveAddress)
          navigateTo.receiveSingleAddress()
        },
      })
      return
    }
    selectedAddressChanged(nextReceiveAddress)
    navigateTo.receiveSingleAddress()
  }

  const handleOnLongPressReceive = (event: GestureResponderEvent) => {
    track.receiveCopyAddressClicked({copy_address_location: 'Long Press wallet Address'})
    copy({text: nextReceiveAddress, event})
  }

  const iconProps = {
    size: 24,
    color: colors.actionColor,
  }

  return (
    <View>
      <Spacer height={16} />

      <View style={styles.centralized}>
        <View style={[styles.row, disabled && styles.disabled]}>
          <View style={styles.centralized}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={handleOnPressReceive}
              testID="receiveButton"
              disabled={disabled}
              onLongPress={handleOnLongPressReceive}
            >
              <Icon.Received {...iconProps} />
            </TouchableOpacity>

            <Text style={styles.actionLabel}>{strings.receiveLabel}</Text>
          </View>

          {!meta.isReadOnly && <Spacer width={18} />}

          {!meta.isReadOnly && (
            <View style={styles.centralized}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={handleOnSend}
                testID="sendButton"
                disabled={disabled}
              >
                <Icon.Send {...iconProps} />
              </TouchableOpacity>

              <Text style={styles.actionLabel}>{strings.sendLabel}</Text>
            </View>
          )}

          {!meta.isReadOnly && (
            <>
              <Spacer width={18} />

              <View style={styles.centralized}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={handleOnSwap}
                  testID="swapButton"
                  disabled={disabled}
                >
                  <Icon.Swap {...iconProps} />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>{strings.swapLabel}</Text>
              </View>

              <Spacer width={18} />

              <View style={styles.centralized}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={handleOnExchange}
                  testID="buyButton"
                  disabled={disabled}
                >
                  <Icon.Exchange {...iconProps} />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>{strings.exchange}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <Spacer height={21} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    centralized: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    actionIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 56,
      width: 56,
      borderRadius: 28,
      backgroundColor: color.primary_500,
    },
    actionLabel: {
      ...atoms.pt_sm,
      ...atoms.body_3_sm_medium,
      color: color.gray_max,
    },
    disabled: {
      opacity: 0.5,
    },
  })

  const colors = {
    actionColor: color.white_static,
  }
  return {styles, colors}
}

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    send: () => navigation.navigate('send-start-tx'),
    receiveSingleAddress: () => navigation.navigate('receive-single'),
    receiveMultipleAddresses: () => navigation.navigate('receive-multiple'),
    swap: () => navigation.navigate('swap-start-swap', {screen: 'token-swap'}),
    swapPreprodNotice: () => navigation.navigate('swap-preprod-notice'),
    swapSanchoNotice: () => navigation.navigate('swap-sancho-notice'),
    exchange: () => navigation.navigate('exchange-create-order'),
  }
}
