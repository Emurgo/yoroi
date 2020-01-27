// @flow
import React from 'react'
import {View, Text, ScrollView} from 'react-native'
import {compose} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl'

import type {ComponentType} from 'react'
import {withNavigationTitle} from '../../utils/renderUtils'
import type {Navigation} from '../../types/navigation'
import {NUMBERS} from '../../config'
import {Button} from '../UiKit'
import globalMessages from '../../i18n/global-messages'

import styles from './styles/DelegationConfirmation.style'

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.confirmDelegation.title',
    defaultMessage: '!!!Confirm delegation',
  },
  delegateButtonLabel: {
    id: 'components.stakingcenter.confirmDelegation.delegateButtonLabel',
    defaultMessage: '!!!Delegate',
  },
})

const DelegationConfirmation = ({intl, navigation, onDelegate}) => {
  const poolHash = navigation.getParam('poolHash')
  const poolName = navigation.getParam('poolName')
  const amountToDelegate = navigation.getParam('amountToDelegate')
  const transactionFee = navigation.getParam('transactionFee')
  const approximateReward = navigation.getParam('approximateReward')
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>
            {intl.formatMessage(globalMessages.stakePoolName)}
          </Text>
          <Text>{poolName}</Text>
        </View>
        <View style={styles.itemBlock}>
          <Text style={styles.itemTitle}>
            {intl.formatMessage(globalMessages.stakePoolHash)}
          </Text>
          <Text>{poolHash}</Text>
        </View>
        <Text>{amountToDelegate.toFormat(NUMBERS.DECIMAL_PLACES_IN_ADA)}</Text>
        <Text>{transactionFee.toFormat(NUMBERS.DECIMAL_PLACES_IN_ADA)}</Text>
        <View style={styles.itemBlock}>
          <Text>
            {approximateReward.toFormat(NUMBERS.DECIMAL_PLACES_IN_ADA)}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBlock}>
        <Button
          block
          shelleyTheme
          onPress={onDelegate}
          title={intl.formatMessage(messages.delegateButtonLabel)}
        />
      </View>
    </View>
  )
}

type ExternalProps = {|
  intl: IntlShape,
  navigation: Navigation,
|}

export default injectIntl(
  (compose(withNavigationTitle(({intl}) => intl.formatMessage(messages.title)))(
    DelegationConfirmation,
  ): ComponentType<ExternalProps>),
)
