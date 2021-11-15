// @flow

import {useNavigation} from '@react-navigation/native'
import React, {memo, useCallback} from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

// $FlowExpectedError
import {ReceivedIcon, SentIcon} from '../../../../src/components'
import {actionMessages} from '../../../i18n/global-messages'
import {WALLET_ROUTES} from '../../../RoutesList'
import {isReadOnlySelector} from '../../../selectors'
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
  buyButton: {
    textAlignVertical: 'center',
    lineHeight: 40,
    fontSize: 32,
    color: COLORS.TEXT_GRAY2,
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

const ActionsBanner = () => {
  const navigation = useNavigation()
  const isReadOnly = useSelector(isReadOnlySelector)
  const intl = useIntl()

  const sendLabel = intl.formatMessage(actionMessages.send)
  const receiveLabel = intl.formatMessage(actionMessages.receive)
  const buyLabel = intl.formatMessage(actionMessages.buy)
  const messageBuy = intl.formatMessage(actionMessages.soon)

  // TODO: adjust navigation for the next wallet tab navigator
  const onSend = useCallback(() => navigation.navigate(WALLET_ROUTES.SEND), [navigation])
  const onReceive = useCallback(() => navigation.navigate(WALLET_ROUTES.RECEIVE), [navigation])
  const onBuy = useCallback(() => alert(messageBuy), [messageBuy])

  return (
    <View style={styles.banner}>
      <Spacer height={16} />
      <View style={styles.centralized}>
        <View style={styles.row}>
          {!isReadOnly && (
            <View style={styles.centralized}>
              <TouchableOpacity style={styles.actionIcon} onPress={onSend}>
                <SentIcon {...ACTION_PROPS} />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>{sendLabel}</Text>
            </View>
          )}

          {!isReadOnly && <Spacer width={32} />}

          <View style={styles.centralized}>
            <TouchableOpacity style={styles.actionIcon} onPress={onReceive}>
              <ReceivedIcon {...ACTION_PROPS} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{receiveLabel}</Text>
          </View>

          <Spacer width={32} />

          <View style={styles.centralized}>
            <TouchableOpacity style={{...styles.actionIcon, ...styles.cta}} onPress={onBuy}>
              {/* TODO: request buy icon to the design team */}
              <Text style={styles.buyButton}>+</Text>
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{buyLabel}</Text>
          </View>
        </View>
      </View>
      <Spacer height={21} />
    </View>
  )
}

export default memo<mixed>(ActionsBanner)
