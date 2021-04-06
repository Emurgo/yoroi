// @flow
import React, {useState} from 'react'
import type {ComponentType} from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {
  View,
  Image,
  TouchableOpacity,
  Clipboard,
  Animated,
  Linking,
} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {debounce} from 'lodash'

import {onWillUnmount} from '../../../utils/renderUtils'
import copyIcon from '../../../assets/img/icon/copy.png'
import {Text} from '../../UiKit'
import {getNetworkConfigById} from '../../../config/networks'

import styles from './styles/VerifyRestoredWallet.style'

import type {NetworkId} from '../../../config/types'

const messages = defineMessages({
  copied: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.copied',
    defaultMessage: '!!!Copied!',
  },
})

const COPY_NOTIFICATION_TIME = 5000 // show 'copied' notification for 5 s

const FadeOutView = (props) => {
  const [fadeAnim] = useState(new Animated.Value(1))

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      delay: 3000,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
      }}
    >
      {props.children}
    </Animated.View>
  )
}

type ExternalProps = {|
  +intl: intlShape,
  +addressHash: string,
  +networkId: NetworkId,
|}

const WalletAddress = ({
  intl,
  addressHash,
  onTapAddress,
  copyHash,
  showCopyNotif,
}) => (
  <View style={styles.addressRowStyles}>
    <TouchableOpacity activeOpacity={0.5} onPress={onTapAddress}>
      <Text numberOfLines={1} ellipsizeMode="middle" style={styles.addressHash}>
        {addressHash}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={debounce(copyHash, COPY_NOTIFICATION_TIME, {
        leading: true,
      })}
    >
      <Image source={copyIcon} style={styles.copyIcon} />
    </TouchableOpacity>
    {showCopyNotif && (
      <FadeOutView>
        <Text style={styles.notifView}>
          {intl.formatMessage(messages.copied)}
        </Text>
      </FadeOutView>
    )}
  </View>
)

export default injectIntl(
  (compose(
    withStateHandlers(
      {
        showCopyNotif: false,
        timeoutIds: [],
      },
      {
        setShowCopyNotif: () => (showCopyNotif) => ({showCopyNotif}),
        registerTimeout: ({timeoutIds}) => (id) => ({
          timeoutIds: [...timeoutIds, id],
        }),
      },
    ),
    withHandlers({
      onTapAddress: ({addressHash, networkId}) => () => {
        const config = getNetworkConfigById(networkId)
        Linking.openURL(config.EXPLORER_URL_FOR_ADDRESS(addressHash))
      },
      copyHash: ({addressHash, setShowCopyNotif, registerTimeout}) => () => {
        Clipboard.setString(addressHash)
        setShowCopyNotif(true)
        const t = setTimeout(
          () => setShowCopyNotif(false),
          COPY_NOTIFICATION_TIME,
        )
        registerTimeout(t)
      },
    }),
    onWillUnmount(({timeoutIds}) =>
      timeoutIds.forEach((id) => clearTimeout(id)),
    ),
  )(WalletAddress): ComponentType<ExternalProps>),
)
