// @flow

import Clipboard from '@react-native-community/clipboard'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Linking, TouchableOpacity, View} from 'react-native'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

import copyIcon from '../../../assets/img/icon/copy.png'
import {getNetworkConfigById} from '../../../config/networks'
import type {NetworkId} from '../../../config/types'
import {FadeOutView} from '../../Common/FadeOutView'
import {Text} from '../../UiKit'
import styles from './styles/VerifyRestoredWallet.style'

const messages = defineMessages({
  copied: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.copied',
    defaultMessage: '!!!Copied!',
  },
})

const WalletAddress = ({
  addressHash,
  networkId,
  style,
}: {
  addressHash: string,
  networkId: NetworkId,
  style?: ViewStyleProp,
}) => {
  const intl = useIntl()
  const [showCopyNotification, setShowCopyNotification] = React.useState(false)

  const onTapAddress = () => {
    const config = getNetworkConfigById(networkId)
    Linking.openURL(config.EXPLORER_URL_FOR_ADDRESS(addressHash))
  }

  const copyHash = () => {
    Clipboard.setString(addressHash)
    setShowCopyNotification(true)
  }

  return (
    <View style={[styles.addressRowStyles, style]}>
      <TouchableOpacity activeOpacity={0.5} onPress={onTapAddress}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.addressHash}>
          {addressHash}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={copyHash}
        disabled={showCopyNotification}
        style={styles.copyButton}
      >
        <Image source={copyIcon} style={styles.copyIcon} />
      </TouchableOpacity>

      <FadeOutView visible={showCopyNotification} onEnd={() => setShowCopyNotification(false)}>
        <Text style={styles.notifView}>{intl.formatMessage(messages.copied)}</Text>
      </FadeOutView>
    </View>
  )
}

export default WalletAddress
