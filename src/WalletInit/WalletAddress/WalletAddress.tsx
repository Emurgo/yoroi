import Clipboard from '@react-native-community/clipboard'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Linking, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'

import copyIcon from '../../assets/img/icon/copy.png'
import {Text} from '../../components'
import {getNetworkConfigById} from '../../legacy/networks'
import {NetworkId} from '../../yoroi-wallets'
import {FadeOutView} from './FadeOutView'

export const WalletAddress = ({
  addressHash,
  networkId,
  style,
}: {
  addressHash: string
  networkId: NetworkId
  style?: ViewStyle
}) => {
  const strings = useStrings()
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
        <Text style={styles.notifView}>{strings.copied}</Text>
      </FadeOutView>
    </View>
  )
}

const messages = defineMessages({
  copied: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.copied',
    defaultMessage: '!!!Copied!',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    copied: intl.formatMessage(messages.copied),
  }
}

const styles = StyleSheet.create({
  addressRowStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 22,
    height: 22,
  },
  notifView: {
    paddingLeft: 4,
  },
  addressHash: {
    width: 280,
    color: '#9B9B9B',
    lineHeight: 30,
  },
})
