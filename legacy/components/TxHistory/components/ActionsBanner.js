// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

// $FlowExpectedError
import {Icon} from '../../../../src/components'
import {actionMessages} from '../../../i18n/global-messages'
import {WALLET_ROUTES} from '../../../RoutesList'
import {isReadOnlySelector} from '../../../selectors'
import {COLORS} from '../../../styles/config'
import {Spacer} from '../../UiKit'

const ActionsBanner = () => {
  const navigation = useNavigation()
  const isReadOnly = useSelector(isReadOnlySelector)
  const strings = useStrings()

  return (
    <View style={styles.banner}>
      <Spacer height={16} />
      <View style={styles.centralized}>
        <View style={styles.row}>
          {!isReadOnly && (
            <View style={styles.centralized}>
              <TouchableOpacity style={styles.actionIcon} onPress={() => navigation.navigate(WALLET_ROUTES.SEND)}>
                <Icon.Sent {...ACTION_PROPS} />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>{strings.send}</Text>
            </View>
          )}

          {!isReadOnly && <Spacer width={32} />}

          <View style={styles.centralized}>
            <TouchableOpacity style={styles.actionIcon} onPress={() => navigation.navigate(WALLET_ROUTES.RECEIVE)}>
              <Icon.Received {...ACTION_PROPS} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{strings.receive}</Text>
          </View>

          <Spacer width={32} />

          <View style={styles.centralized}>
            <TouchableOpacity style={{...styles.actionIcon, ...styles.cta}} onPress={() => alert(strings.buy)}>
              {/* TODO: request buy icon to the design team */}
              <Text style={styles.buyButton}>+</Text>
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{strings.buy}</Text>
          </View>
        </View>
      </View>
      <Spacer height={21} />
    </View>
  )
}

export default ActionsBanner

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

const useStrings = () => {
  const intl = useIntl()

  return {
    send: intl.formatMessage(actionMessages.send),
    receive: intl.formatMessage(actionMessages.receive),
    buy: intl.formatMessage(actionMessages.buy),
    soon: intl.formatMessage(actionMessages.soon),
  }
}
