import Clipboard from '@react-native-community/clipboard'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Linking, TouchableOpacity, View} from 'react-native'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

import copyIcon from '../../../legacy/assets/img/icon/copy.png'
import {FadeOutView} from '../../../legacy/components/Common/FadeOutView'
import {Text} from '../../../legacy/components/UiKit'
import styles from '../../../legacy/components/WalletInit/RestoreWallet/styles/VerifyRestoredWallet.style'
import {getNetworkConfigById} from '../../../legacy/config/networks'
import type {NetworkId} from '../../../legacy/config/types'

export const WalletAddress = ({
  addressHash,
  networkId,
  style,
}: {
  addressHash: string
  networkId: NetworkId
  style?: ViewStyleProp
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
