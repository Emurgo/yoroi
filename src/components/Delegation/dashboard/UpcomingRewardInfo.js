// @flow
import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

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
      '!!!Remember that your first reward will be allocated ' +
      'two  epochs after the end of the epoch in which you have submitted ' +
      'your delegation transaction.',
  },
})

type ExternalProps = {|
  +intl: intlShape,
  +nextRewardText: ?string,
  +followingRewardText: ?string,
  +showDisclaimer: boolean,
|}

const UpcomingRewardInfo = ({
  intl,
  nextRewardText,
  followingRewardText,
  showDisclaimer,
}: ExternalProps) => {
  if (nextRewardText != null && followingRewardText != null) {
    return (
      <View
        style={[
          styles.wrapper,
          showDisclaimer ? styles.wrapperWithDisclaimer : undefined,
        ]}
      >
        <TitledCard>
          <View style={styles.stats}>
            <View style={styles.row}>
              <Text style={styles.label}>
                {intl.formatMessage(messages.nextRewardLabel)}:
              </Text>
              <Text style={styles.value}>{nextRewardText}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>
                {intl.formatMessage(messages.followingRewardLable)}:
              </Text>
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

export default injectIntl(UpcomingRewardInfo)
