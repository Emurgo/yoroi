import {formatTokenWithText} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {type Proposal, type Vote} from '@yoroi/tx'

import * as React from 'react'
import {Text, View} from 'react-native'

import {Address} from '~/common/Address/Address'
import {Operations, useOperations} from '~/features/ReviewTx/common/operations'
import {FormattedTx} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Divider} from '~/ui/Divider/Divider'
import {Space} from '~/ui/Space/Space'

export const OperationsTab = ({
  tx,
  operations: providedOperations,
  operationsNotice,
}: {
  tx: FormattedTx
  operations?: Operations
  operationsNotice?: React.ReactNode
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const defaultOperations = useOperations(tx.certificates)
  const ops = providedOperations ?? defaultOperations

  const hasCertificates = tx.certificates != null && tx.certificates.length > 0
  const hasWithdrawals = tx.withdrawals != null && tx.withdrawals.length > 0
  const hasGovernance = tx.governance != null

  if (!hasCertificates && !hasWithdrawals && !hasGovernance) {
    return null
  }

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      {hasCertificates && (
        <>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.operationsLabel}
          </Text>
          <Space.Height.md />

          {operationsNotice != null && (
            <>
              {operationsNotice}
              <Space.Height.lg />
            </>
          )}

          {ops.components
            .filter((component) => !component.duplicated)
            .map(({component}, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Space.Height.sm />}
                {component}
              </React.Fragment>
            ))}
          {(hasWithdrawals || hasGovernance) && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasWithdrawals && (
        <>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.withdrawals.label} ({tx.withdrawals!.length})
          </Text>
          <Space.Height.md />
          <Withdrawals withdrawals={tx.withdrawals!} />
          {hasGovernance && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
        </>
      )}

      {hasGovernance && (
        <>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.tabLabel.governance}
          </Text>
          <Space.Height.md />
          <GovernanceContent tx={tx} />
        </>
      )}

      <Space.Height.lg />
    </View>
  )
}

const GovernanceContent = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (!tx.governance) {
    return null
  }

  const {proposals, votes} = tx.governance

  return (
    <View>
      {proposals.length > 0 && (
        <View>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.governance.proposalsLabel} ({proposals.length})
          </Text>
          <Space.Height.md />
          {proposals.map((proposal, index) => (
            <View key={`proposal-${index}`}>
              {index > 0 && <Space.Height.md />}
              <ProposalItem proposal={proposal} index={index} />
            </View>
          ))}
        </View>
      )}

      {votes.length > 0 && (
        <View>
          {proposals.length > 0 && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.governance.votesLabel} ({votes.length})
          </Text>
          <Space.Height.md />
          {votes.map((vote, index) => (
            <View key={`vote-${index}`}>
              {index > 0 && <Space.Height.md />}
              <VoteItem vote={vote} index={index} />
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const ProposalItem = ({
  proposal,
  index,
}: {
  proposal: Proposal
  index: number
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(false)

  return (
    <Accordion
      label={`${strings.txReview.governance.proposalLabel} #${index + 1}`}
      expanded={expanded}
      onChange={setExpanded}
    >
      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.actionTypeLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${proposal.governanceAction.type}`}</Text>
      </View>

      {proposal.governanceAction.actionId &&
        proposal.governanceAction.actionId.txHash && (
          <>
            <Space.Height.md />
            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                {strings.txReview.governance.actionIdLabel}:
              </Text>
              <Copiable
                text={`${proposal.governanceAction.actionId.txHash}:${proposal.governanceAction.actionId.txIndex}`}
                style={a.flex_1}
              >
                <Text
                  style={[
                    a.flex_1,
                    a.body_2_md_regular,
                    {color: p.text_gray_medium},
                    a.text_right,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {proposal.governanceAction.actionId.txHash}:
                  {proposal.governanceAction.actionId.txIndex}
                </Text>
              </Copiable>
            </View>
          </>
        )}

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.anchorUrlLabel}:
        </Text>
        <Text
          style={[
            a.flex_1,
            a.body_2_md_regular,
            {color: p.text_gray_medium},
            a.text_right,
          ]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {proposal.anchor.url}
        </Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.anchorHashLabel}:
        </Text>
        <Copiable text={proposal.anchor.hash} style={a.flex_1}>
          <Text
            style={[
              a.flex_1,
              a.body_2_md_regular,
              {color: p.text_gray_medium},
              a.text_right,
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {proposal.anchor.hash}
          </Text>
        </Copiable>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.depositLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${proposal.deposit} ADA`}</Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.rewardAccountLabel}:
        </Text>
        <Copiable text={proposal.rewardAccount} style={a.flex_1}>
          <Text
            style={[
              a.flex_1,
              a.body_2_md_regular,
              {color: p.text_gray_medium},
              a.text_right,
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {proposal.rewardAccount}
          </Text>
        </Copiable>
      </View>

      {proposal.governanceAction.parameters && (
        <>
          <Space.Height.md />
          <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.governance.parametersLabel}:
          </Text>
          <Space.Height.sm />
          <View
            style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_md]}
          >
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium, fontFamily: 'monospace'},
              ]}
            >
              {JSON.stringify(proposal.governanceAction.parameters, null, 2)}
            </Text>
          </View>
        </>
      )}

      <Space.Height.lg />
    </Accordion>
  )
}

const VoteItem = ({vote, index}: {vote: Vote; index: number}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const [expanded, setExpanded] = React.useState(false)

  return (
    <Accordion
      label={`${strings.txReview.governance.voteLabel} #${index + 1}`}
      expanded={expanded}
      onChange={setExpanded}
    >
      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.voterTypeLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${vote.voter.type}`}</Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.voterCredentialLabel}:
        </Text>
        <Copiable text={vote.voter.credential} style={a.flex_1}>
          <Text
            style={[
              a.flex_1,
              a.body_2_md_regular,
              {color: p.text_gray_medium},
              a.text_right,
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {vote.voter.credential}
          </Text>
        </Copiable>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.voteChoiceLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${vote.votingProcedure.vote}`}</Text>
      </View>

      <Space.Height.md />

      {vote.governanceActionId.txHash && (
        <>
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.governance.actionIdLabel}:
            </Text>
            <Copiable
              text={`${vote.governanceActionId.txHash}:${vote.governanceActionId.txIndex}`}
              style={a.flex_1}
            >
              <Text
                style={[
                  a.flex_1,
                  a.body_2_md_regular,
                  {color: p.text_gray_medium},
                  a.text_right,
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {vote.governanceActionId.txHash}:
                {vote.governanceActionId.txIndex}
              </Text>
            </Copiable>
          </View>
        </>
      )}

      {vote.votingProcedure.anchor && (
        <>
          <Space.Height.md />
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.governance.anchorUrlLabel}:
            </Text>
            <Text
              style={[
                a.flex_1,
                a.body_2_md_regular,
                {color: p.text_gray_medium},
                a.text_right,
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {vote.votingProcedure.anchor.url}
            </Text>
          </View>

          <Space.Height.md />

          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.governance.anchorHashLabel}:
            </Text>
            <Copiable text={vote.votingProcedure.anchor.hash} style={a.flex_1}>
              <Text
                style={[
                  a.flex_1,
                  a.body_2_md_regular,
                  {color: p.text_gray_medium},
                  a.text_right,
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {vote.votingProcedure.anchor.hash}
              </Text>
            </Copiable>
          </View>
        </>
      )}

      <Space.Height.lg />
    </Accordion>
  )
}

const Withdrawals = ({
  withdrawals,
}: {
  withdrawals: FormattedTx['withdrawals']
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (!withdrawals || withdrawals.length === 0) {
    return null
  }

  return (
    <View>
      {withdrawals.map((withdrawal, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <>
              <Space.Height.lg />
              <Divider verticalSpace="md" />
            </>
          )}

          <View style={[a.flex_col, a.gap_md]}>
            <View style={[a.flex_col, a.gap_sm]}>
              <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                {strings.txReview.withdrawal.address}
              </Text>
              <View style={[a.flex_row, a.align_center]}>
                <Address
                  address={withdrawal.address}
                  style={a.flex_1}
                  textStyle={[a.body_2_md_regular, {color: p.text_gray_medium}]}
                />
              </View>
            </View>

            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
                {strings.txReview.withdrawal.amount}
              </Text>
              <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
                {formatTokenWithText(withdrawal.amount, withdrawal.tokenInfo)}
              </Text>
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  )
}
