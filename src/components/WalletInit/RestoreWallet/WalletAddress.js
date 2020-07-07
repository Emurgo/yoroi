// @flow
import React, {useState} from 'react'
import type {ComponentType} from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {View, Image, TouchableOpacity, Clipboard, Animated} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {debounce} from 'lodash'

import {onWillUnmount} from '../../../utils/renderUtils'
import copyIcon from '../../../assets/img/icon/copy.png'
import {Text} from '../../UiKit'
import styles from './styles/VerifyRestoredWallet.style'

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
|}

const WalletAddress = ({intl, addressHash, copyPoolHash, showCopyNotif}) => (
  <View style={styles.addressRowStyles}>
    <Text numberOfLines={1} ellipsizeMode="middle" style={styles.addressHash}>
      {addressHash}
    </Text>
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={debounce(copyPoolHash, COPY_NOTIFICATION_TIME, {
        leading: true,
      })}
    >
      <Image source={copyIcon} style={styles.copyIcon} width={24} height={24} />
    </TouchableOpacity>
    {showCopyNotif && (
      <FadeOutView>
        <Text style={styles.copyIcon}>
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
      copyPoolHash: ({
        addressHash,
        setShowCopyNotif,
        registerTimeout,
      }) => () => {
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
