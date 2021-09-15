// @flow

import React from 'react'
import {View} from 'react-native'
import {useIntl, defineMessages} from 'react-intl'

import {Text, TitledCard} from '../../UiKit'
import styles from './styles/UpcomingRewardInfo.style'

const messages = defineMessages({
  nextRewardLabel: {
    id: 'components.delegationsummary.upcomingReward.nextLabel',
    defaultMessage: '!!!Next reward',
  },
  followingRewardLable: {
    id: 'components.delegationsummary.upcomingReward.followingLabel',
    defaultMessage: '!!!Following reward',
  },
  rewardDisclaimerText: {
    id: 'components.delegationsummary.upcomingReward.rewardDisclaimerText',
    defaultMessage:
      '!!!Note that after you delegate to a stake pool, you will need ' +
      'to wait until the end of the epoch, plus two additional epochs, ' +
      'before starting receiving rewards.',
  },
})

type ExternalProps = {|
  +nextRewardText: ?string,
  +followingRewardText: ?string,
  +showDisclaimer: boolean,
|}

const UpcomingRewardInfo = ({nextRewardText, followingRewardText, showDisclaimer}: ExternalProps) => {
  const intl = useIntl()

  if (nextRewardText != null && followingRewardText != null) {
    return (
      <View style={[styles.wrapper, showDisclaimer ? styles.wrapperWithDisclaimer : undefined]}>
        <TitledCard>
          <View style={styles.stats}>
            <View style={styles.row}>
              <Text style={styles.label}>{intl.formatMessage(messages.nextRewardLabel)}:</Text>
              <Text style={styles.value}>{nextRewardText}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{intl.formatMessage(messages.followingRewardLable)}:</Text>
              <Text style={styles.value}>{followingRewardText}</Text>
            </View>
          </View>
        </TitledCard>
        {showDisclaimer && (
          <Text secondary style={styles.disclaimerText}>
            {intl.formatMessage(messages.rewardDisclaimerText)}
          </Text>
        )}
      </View>
    )
  } else {
    return (
      <View style={styles.simpleWrapper}>
        <Text secondary style={styles.disclaimerText}>
          {intl.formatMessage(messages.rewardDisclaimerText)}
        </Text>
      </View>
    )
  }
}

export default UpcomingRewardInfo
