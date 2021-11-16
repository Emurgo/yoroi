// @flow

import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes'

// $FlowExpectedError
import {Spacer} from '../../../../src/components'
import TotalAdaIcon from '../../../assets/staking/TotalAdaIcon'
import TotalDelegatedIcon from '../../../assets/staking/TotalDelegatedIcon'
import TotalRewardIcon from '../../../assets/staking/TotalRewardIcon'
import globalMessages from '../../../i18n/global-messages'
import {COLORS} from '../../../styles/config'
import {formatAdaWithText} from '../../../utils/format'
import {Button, Text, TitledCard} from '../../UiKit'

type Props = {|
  +totalAdaSum: ?BigNumber,
  +totalRewards: ?BigNumber,
  +totalDelegated: ?BigNumber,
  +onWithdraw: () => void,
  +disableWithdraw: boolean,
|}

const UserSummary = ({totalAdaSum, totalRewards, totalDelegated, onWithdraw, disableWithdraw}: Props) => {
  const strings = useStrings()

  return (
    <TitledCard title={strings.title}>
      <Col style={{flex: 1}}>
        <Row>
          <Spacer width={8} />
          <TotalAdaIcon width={ICON_DIM} height={ICON_DIM} />
          <Spacer width={16} />

          <Col>
            <Text style={styles.label}>{strings.availableFunds}:</Text>
            <Text bold style={styles.value}>
              {totalAdaSum != null ? formatAdaWithText(totalAdaSum) : '-'}
            </Text>
          </Col>
        </Row>

        <Row>
          <Spacer width={8} />
          <TotalRewardIcon width={ICON_DIM} height={ICON_DIM} />
          <Spacer width={16} />

          <Col>
            <Text style={styles.label}>{strings.rewardsLabel}:</Text>
            <Text bold style={styles.value}>
              {totalRewards != null ? formatAdaWithText(totalRewards) : '-'}
            </Text>
          </Col>

          <Spacer fill />

          <Button
            disabled={disableWithdraw}
            outlineOnLight
            shelleyTheme
            onPress={onWithdraw}
            title={strings.withdrawButtonTitle}
            style={styles.withdrawButton}
          />
        </Row>

        <Row>
          <Spacer width={8} />
          <TotalDelegatedIcon width={ICON_DIM} height={ICON_DIM} />
          <Spacer width={16} />

          <Col>
            <Text style={styles.label}>{strings.delegatedLabel}:</Text>
            <Text bold style={styles.value}>
              {totalDelegated != null ? formatAdaWithText(totalDelegated) : '-'}
            </Text>
          </Col>
        </Row>
      </Col>
    </TitledCard>
  )
}

export default UserSummary

const Row = ({style, ...props}: ViewProps) => <View {...props} style={[style, styles.row]} />
const Col = ({style, ...props}: ViewProps) => <View {...props} style={[style, {flexDirection: 'column'}]} />

const messages = defineMessages({
  title: {
    id: 'components.delegationsummary.userSummary.title',
    defaultMessage: '!!!Your Summary',
  },
  rewardsLabel: {
    id: 'components.delegationsummary.userSummary.totalRewards',
    defaultMessage: '!!!Total Rewards',
  },
  delegatedLabel: {
    id: 'components.delegationsummary.userSummary.totalDelegated',
    defaultMessage: '!!!Total Delegated',
  },
  withdrawButtonTitle: {
    id: 'components.delegationsummary.userSummary.withdrawButtonTitle',
    defaultMessage: '!!!Withdraw',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    rewardsLabel: intl.formatMessage(messages.rewardsLabel),
    delegatedLabel: intl.formatMessage(messages.delegatedLabel),
    withdrawButtonTitle: intl.formatMessage(messages.withdrawButtonTitle),
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
  }
}

const ICON_DIM = 44

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  label: {
    color: COLORS.DARK_TEXT,
    lineHeight: 24,
    fontSize: 14,
  },
  value: {
    color: COLORS.DARK_GRAY,
    lineHeight: 24,
    fontSize: 16,
  },
  withdrawButton: {
    minHeight: undefined,
  },
})
