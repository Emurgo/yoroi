// @flow
import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, TitledCard} from '../../UiKit'
import styles from './styles/UpcomingRewardInfo.style'

const messages = defineMessages({
  nextRewardLable: {
    id: 'components.delegationsummary.upcomingReward.nextLabel',
    defaultMessage: '!!!Next reward',
  },
  followingRewardLable: {
    id: 'components.delegationsummary.upcomingReward.followingLabel',
    defaultMessage: '!!!Following reward',
  },
  rewardDisclaimerText: {
    id: 'components.delegationsummary.upcomingReward.rewardDisclaimerText',
    defaultMessage: '!!!First reward is slower',
  },
})

type ExternalProps = {|
  +intl: intlShape,
  +nextRewardText: string,
  +followingRewardText: string,
  +showDisclaimer: boolean,
|}

const UpcomingRewardInfo = ({
  intl,
  nextRewardText,
  followingRewardText,
  showDisclaimer,
}: ExternalProps) => (
  <View style={[styles.wrapper, showDisclaimer ? styles.wrapperWithDisclaimer : undefined]}>
    <TitledCard>
      <View style={styles.stats}>
        <View style={styles.row}>
          <Text style={styles.label}>{intl.formatMessage(messages.nextRewardLable)}:</Text>
          <Text style={styles.value}>{nextRewardText}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{intl.formatMessage(messages.followingRewardLable)}:</Text>
          <Text style={styles.value}>{followingRewardText}</Text>
        </View>
      </View>
    </TitledCard>
    {showDisclaimer && (
      <Text style={styles.disclaimerText}>
        {intl.formatMessage(messages.rewardDisclaimerText)}
      </Text>
    )}
  </View>
)

export default injectIntl(UpcomingRewardInfo)
