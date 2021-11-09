import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import {actionMessages} from '../../../legacy/i18n/global-messages'
import {WALLET_ROUTES} from '../../../legacy/RoutesList'
import {isReadOnlySelector} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {Spacer} from '../../components/Spacer'
import ReceivedIcon from '../../components/StylizedIcons/ReceivedIcon'
import SentIcon from '../../components/StylizedIcons/SentIcon'
import features from '../../features'

const ACTION_PROPS = {
  height: 36,
  width: 36,
  color: COLORS.WHITE,
}

export const ActionsBanner = () => {
  const strings = useStrings()
  const navigateTo = useNavigations()
  const isReadOnly = useSelector(isReadOnlySelector)

  return (
    <View style={styles.banner}>
      <Spacer height={16} />

      <View style={styles.centralized}>
        <View style={styles.row}>
          {!isReadOnly && (
            <View style={styles.centralized}>
              <TouchableOpacity style={styles.actionIcon} onPress={navigateTo.onSend}>
                <SentIcon {...ACTION_PROPS} />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>{strings.sendLabel}</Text>
            </View>
          )}

          {!isReadOnly && <Spacer width={32} />}

          <View style={styles.centralized}>
            <TouchableOpacity style={styles.actionIcon} onPress={navigateTo.onReceive}>
              <ReceivedIcon {...ACTION_PROPS} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{strings.receiveLabel}</Text>
          </View>

          {features.walletHero.buy && <Spacer width={32} />}

          {features.walletHero.buy && (
            <View style={styles.centralized}>
              <TouchableOpacity style={[styles.actionIcon, styles.cta]} onPress={navigateTo.onBuy}>
                {/* TODO: request buy icon to the design team */}
                <Text style={styles.buyButton}>+</Text>
              </TouchableOpacity>
              <Text style={styles.actionLabel}>{strings.buyLabel}</Text>
            </View>
          )}
        </View>
      </View>

      <Spacer height={21} />
    </View>
  )
}

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

const useStrings = () => {
  const intl = useIntl()

  return {
    sendLabel: intl.formatMessage(actionMessages.send),
    receiveLabel: intl.formatMessage(actionMessages.receive),
    buyLabel: intl.formatMessage(actionMessages.buy),
    messageBuy: intl.formatMessage(actionMessages.soon),
  }
}

const useNavigations = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  return {
    onSend: () => navigation.navigate(WALLET_ROUTES.SEND),
    onReceive: () => navigation.navigate(WALLET_ROUTES.RECEIVE),
    onBuy: () => Alert.alert(strings.messageBuy, strings.messageBuy),
  }
}
