import {atoms as a, useTheme} from '@yoroi/theme'
import {type Proposal, type Vote} from '@yoroi/tx'

import * as React from 'react'
import {Text, View} from 'react-native'

import {FormattedTx} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

export const GovernanceTab = ({tx}: {tx: FormattedTx}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (!tx.governance) {
    return (
      <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
        <Space.Height.lg />
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.noGovernanceActions}
        </Text>
      </View>
    )
  }

  const {proposals, votes} = tx.governance

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      {proposals.length > 0 && (
        <>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.governance.proposalsLabel} ({proposals.length})
          </Text>
          <Space.Height.md />
          {proposals.map((proposal, index) => (
            <ProposalItem
              key={`proposal-${index}`}
              proposal={proposal}
              index={index}
            />
          ))}
          <Space.Height.lg />
        </>
      )}

      {votes.length > 0 && (
        <>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
            {strings.txReview.governance.votesLabel} ({votes.length})
          </Text>
          <Space.Height.md />
          {votes.map((vote, index) => (
            <VoteItem key={`vote-${index}`} vote={vote} index={index} />
          ))}
          <Space.Height.lg />
        </>
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

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.actionTypeLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${proposal.governanceAction.type}`}</Text>
      </View>

      {proposal.governanceAction.actionId && (
        <>
          <Space.Height.md />
          <View style={[a.flex_row, a.justify_between]}>
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

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.anchorUrlLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
          numberOfLines={1}
        >
          {proposal.anchor.url}
        </Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
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

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.depositLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${proposal.deposit} ADA`}</Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
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
            style={[
              {
                backgroundColor: p.bg_color_min,
                padding: 12,
                borderRadius: 8,
              },
            ]}
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

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.voterTypeLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${vote.voter.type}`}</Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
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

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
          {strings.txReview.governance.voteChoiceLabel}:
        </Text>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
        >{`${vote.votingProcedure.vote}`}</Text>
      </View>

      <Space.Height.md />

      <View style={[a.flex_row, a.justify_between]}>
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
            {vote.governanceActionId.txHash}:{vote.governanceActionId.txIndex}
          </Text>
        </Copiable>
      </View>

      {vote.votingProcedure.anchor && (
        <>
          <Space.Height.md />
          <View style={[a.flex_row, a.justify_between]}>
            <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.governance.anchorUrlLabel}:
            </Text>
            <Text
              style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
              numberOfLines={1}
            >
              {vote.votingProcedure.anchor.url}
            </Text>
          </View>

          <Space.Height.md />

          <View style={[a.flex_row, a.justify_between]}>
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
