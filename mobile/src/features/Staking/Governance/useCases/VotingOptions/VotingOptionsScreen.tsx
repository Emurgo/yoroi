import {GovernanceProvider} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {GovernanceStatusCard} from '~/features/Staking/Governance/common/GovernanceStatusCard/GovernanceStatusCard'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {OtherDrepCard} from '~/features/Staking/Governance/common/OtherDrepCard/OtherDrepCard'
import {YoroiDrepCard} from '~/features/Staking/Governance/common/YoroiDrepCard/YoroiDrepCard'
import {useRemoteConfig} from '~/hooks/useRemoteConfig'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

import {useVotingOptions} from '../../common/helpers'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const VotingOptionsScreen = () => {
  const {config} = useRemoteConfig()
  const isYoroiDrepBannerEnabled = config?.banners?.yoroiDrep?.display ?? false
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {openModal} = useModal()

  const {
    manager,
    isPending,
    isDelegatingToYoroiDrep,
    isDelegatingToOtherDrep,
    confirmedDelegatingToOther,
    otherDrepDisplayId,
    isAbstaining,
    isNoConfidence,
    handleDelegate,
    handleDelegateToYoroi,
    handleAbstain,
    handleNoConfidence,
  } = useVotingOptions()

  const openDRepIdModal = (
    onSubmit: (options: {
      hash: string
      type: 'key' | 'script'
      CIP105: boolean
    }) => void,
  ) => {
    openModal({
      title: strings.staking.enterDRepID,
      content: (
        <GovernanceProvider manager={manager}>
          <EnterDrepIdModal onSubmit={onSubmit} />
        </GovernanceProvider>
      ),
      height: 650,
    })
  }

  const onDelegate = () => {
    openDRepIdModal(handleDelegate)
  }

  const showYoroiDrep = isYoroiDrepBannerEnabled

  return (
    <ScrollView style={[a.px_lg, a.flex_1, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.staking.votingOptionsDescription}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {showYoroiDrep && (
          <YoroiDrepCard
            onDelegate={
              isDelegatingToYoroiDrep || isPending
                ? undefined
                : handleDelegateToYoroi
            }
            pending={isPending}
            isDelegating={isDelegatingToYoroiDrep}
            truncateId
          />
        )}

        {isDelegatingToOtherDrep && otherDrepDisplayId ? (
          <OtherDrepCard
            drepId={otherDrepDisplayId}
            isDelegating={confirmedDelegatingToOther}
            truncateId
            onDelegate={isPending ? undefined : onDelegate}
            pending={isPending}
          />
        ) : (
          <VotingOptionCard
            icon={
              <IconContainer color={isPending ? p.gray_200 : p.bg_color_min}>
                <Icon.OtherDreps size={24} color={p.el_gray_medium} />
              </IconContainer>
            }
            title={strings.staking.otherDReps}
            description={strings.staking.actionDelegateToADRepDescription}
            onDelegate={onDelegate}
            pending={isPending}
          />
        )}

        <GovernanceStatusCard
          type="abstain"
          isDelegating={isAbstaining}
          onChangeToDrep={onDelegate}
          onDelegate={handleAbstain}
          pending={isPending}
        />

        <GovernanceStatusCard
          type="no-confidence"
          isDelegating={isNoConfidence}
          onChangeToDrep={onDelegate}
          onDelegate={handleNoConfidence}
          pending={isPending}
        />
      </View>

      <Space.Height.lg />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}

type VotingOptionCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  onDelegate: () => void
  pending?: boolean
}

const VotingOptionCard = ({
  icon,
  title,
  description,
  onDelegate,
  pending,
}: VotingOptionCardProps) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View
      style={[
        a.rounded_sm,
        a.p_lg,
        a.border,
        {borderColor: p.gray_200, opacity: pending ? 0.5 : 1},
      ]}
    >
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        {icon}

        <Text style={[a.heading_4_medium, ta.text_gray_medium]}>{title}</Text>
      </View>

      <Space.Height.sm />

      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {description}
      </Text>

      <Space.Height.md />

      <Button
        title={strings.staking.confirmDelegation.delegateButtonLabel}
        type={ButtonType.Secondary}
        onPress={onDelegate}
        disabled={pending}
      />
    </View>
  )
}

const IconContainer = ({
  children,
  color,
}: {
  children: React.ReactNode
  color: string
}) => {
  return (
    <View
      style={[
        a.align_center,
        a.justify_center,
        {width: 48, height: 48, borderRadius: 24, backgroundColor: color},
      ]}
    >
      {children}
    </View>
  )
}
