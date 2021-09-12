// @flow

import React, {memo} from 'react'
import {useSelector} from 'react-redux'
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native'
import {injectIntl, type IntlShape} from 'react-intl'
import {useNavigation} from '@react-navigation/native'

import {actionMessages} from '../../../i18n/global-messages'
import {isReadOnlySelector} from '../../../selectors'
import {WALLET_ROUTES} from '../../../RoutesList'
import SentIcon from '../../../assets/SentIcon'
import ReceivedIcon from '../../../assets/ReceivedIcon'
import {COLORS} from '../../../styles/config'
import {Spacer} from '../../UiKit'

// NOTE: layout is following inVision spec
// https://projects.invisionapp.com/d/main?origin=v7#/console/21500065/456867605/inspect?scrollOffset=2856#project_console
const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
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
    height: 42,
    width: 42,
    borderRadius: 20,
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
  },
  cta: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  actionLabel: {
    paddingTop: 8,
    fontSize: 10,
    color: COLORS.TEXT_GRAY3,
  },
})

const ACTION_PROPS = {
  height: 36,
  width: 36,
  color: COLORS.WHITE,
}

type ActionBannerProps = {|
  +intl: IntlShape,
|}

const ActionsBanner = ({intl}: ActionBannerProps) => {
  const navigation = useNavigation()
  const isReadOnly = useSelector(isReadOnlySelector)

  const sendLabel = intl.formatMessage(actionMessages.send)
  const receiveLabel = intl.formatMessage(actionMessages.receive)
  const buyLabel = intl.formatMessage(actionMessages.buy)
  const messageBuy = intl.formatMessage(actionMessages.soon)

  // TODO: adjust navigation for the next wallet tab navigator
  const onSend = () => navigation.navigate(WALLET_ROUTES.SEND)
  const onReceive = () => navigation.navigate(WALLET_ROUTES.RECEIVE)

  // eslint-disable-next-line no-alert
  const onBuy = () => alert(messageBuy)

  const actions = [
    isReadOnly ? null : (
      <View key="ab-on-send" style={styles.centralized}>
        <TouchableOpacity style={styles.actionIcon} onPress={onSend}>
          <SentIcon {...ACTION_PROPS} />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>{sendLabel}</Text>
      </View>
    ),
    isReadOnly ? null : <Spacer key="ab-spacer-1" width={32} />,
    <View key="ab-on-receive" style={styles.centralized}>
      <TouchableOpacity style={styles.actionIcon} onPress={onReceive}>
        <ReceivedIcon {...ACTION_PROPS} />
      </TouchableOpacity>
      <Text style={styles.actionLabel}>{receiveLabel}</Text>
    </View>,
    <Spacer key="ab-spacer-2" width={32} />,
    <View key="ab-on-buy" style={styles.centralized}>
      <TouchableOpacity style={{...styles.actionIcon, ...styles.cta}} onPress={onBuy}>
        {/* TODO: request buy icon to the design team */}
        <SentIcon color={COLORS.TEXT_GRAY2} />
      </TouchableOpacity>
      <Text style={styles.actionLabel}>{buyLabel}</Text>
    </View>,
  ]

  return (
    <View style={styles.banner}>
      <Spacer height={16} />
      <View style={styles.centralized}>
        <View style={styles.row}>{actions}</View>
      </View>
      <Spacer height={21} />
    </View>
  )
}

export default injectIntl(memo<ActionBannerProps>(ActionsBanner))
