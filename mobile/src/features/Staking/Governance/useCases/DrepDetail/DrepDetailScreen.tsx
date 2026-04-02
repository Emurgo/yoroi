import {useDelegationCertificate, useGovernance} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {NotEnoughMoneyToSendError} from '@yoroi/tx'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {RouteProp, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Image, Linking, Pressable, ScrollView, Text, View} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {formatDrepHashToCIP105Format} from '~/features/Staking/Governance/common/drep'
import {
  Routes,
  useNavigateTo,
} from '~/features/Staking/Governance/common/navigation'
import {useGovernanceVoteFlow} from '~/features/Staking/Governance/common/useGovernanceVoteFlow'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

// ── Main Screen ───────────────────────────────────────────────────────────────

export const DrepDetailScreen = () => {
  const {params} = useRoute<RouteProp<Routes, 'staking-gov-drep-detail'>>()
  const {atoms: ta, palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {manager} = useGovernance()
  const navigateTo = useNavigateTo()

  const stakingInfo = useStakingInfo(wallet)
  const needsToRegisterStakingKey =
    stakingInfo?.data?.status === 'not-registered'

  const createDelegationCertificate = useDelegationCertificate()

  const {pendingVote, isCreatingTx, submitDelegate} = useGovernanceVoteFlow({
    wallet,
    addressMode: meta.addressMode,
    options: {
      shouldThrow: false,
      onError: (error) => {
        if (error instanceof NotEnoughMoneyToSendError) {
          navigateTo.noFunds()
          return
        }
        throw error
      },
    },
  })

  const isPending = isCreatingTx || pendingVote !== null

  const cip105Id = formatDrepHashToCIP105Format(params.hexId)
  const isVerified = params.metadataVerification === 'verified'

  const handleDelegate = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()
    const type = params.from === 'verificationKey' ? 'key' : 'script'

    const certificate = await createDelegationCertificate({
      hash: params.hexId,
      type,
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitDelegate(certs, {hash: params.hexId, type, CIP105: false})
  }

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
      <ScrollView
        style={[a.flex_1]}
        contentContainerStyle={[a.px_lg, a.pt_sm, {paddingBottom: 120}]}
      >
        {/* Avatar + Name header */}
        <View
          style={[a.flex_row, a.align_center, a.gap_sm, {marginBottom: 16}]}
        >
          <AvatarImage imageUrl={params.imageUrl} />

          <View style={[a.flex_1]}>
            <Text
              style={[a.heading_3_medium, {color: p.text_gray_medium}]}
              numberOfLines={2}
            >
              {params.name}
            </Text>
          </View>
        </View>

        {/* Connection details */}
        <IdRow label="DRep ID" value={params.bech32Id} />
        <Space.Height.sm />
        <IdRow label="Legacy DRep ID (CIP-105)" value={cip105Id} />

        {Boolean(params.socialMedia) && (
          <>
            <Space.Height.sm />
            <SocialMediaRow url={params.socialMedia} />
          </>
        )}

        {/* Divider */}
        <View
          style={[{height: 1, backgroundColor: p.gray_200, marginVertical: 16}]}
        />

        {isVerified ? (
          <MetadataSections
            objectives={params.objectives}
            motivations={params.motivations}
            qualifications={params.qualifications}
          />
        ) : (
          <UnverifiedSection />
        )}
      </ScrollView>

      {/* Fixed DELEGATE button */}
      <View
        style={[
          a.px_lg,
          a.pb_lg,
          a.pt_sm,
          {
            borderTopWidth: 1,
            borderTopColor: p.gray_100,
            backgroundColor: p.bg_color_max,
          },
        ]}
      >
        <Button
          title="DELEGATE"
          onPress={handleDelegate}
          disabled={isPending}
        />
      </View>
    </View>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const AvatarImage = ({imageUrl}: {imageUrl: string}) => {
  const {palette: p} = useTheme()
  const [imageError, setImageError] = React.useState(false)
  const showImage = Boolean(imageUrl) && !imageError

  return (
    <View
      style={[
        a.align_center,
        a.justify_center,
        a.rounded_full,
        {
          width: 56,
          height: 56,
          backgroundColor: p.bg_color_min,
          overflow: 'hidden',
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{uri: imageUrl}}
          style={{width: 56, height: 56, borderRadius: 28}}
          onError={() => setImageError(true)}
        />
      ) : (
        <Icon.OtherDreps size={28} color={p.el_gray_medium} />
      )}
    </View>
  )
}

type IdRowProps = {label: string; value: string}

const IdRow = ({label, value}: IdRowProps) => {
  const {palette: p} = useTheme()
  const truncated =
    value.length > 20 ? `${value.slice(0, 10)}...${value.slice(-8)}` : value
  const {copy, isCopying} = useCopy()

  const handleCopy = () => {
    copy({text: value, feedback: 'Copied!'})
  }

  return (
    <View style={[a.flex_row, a.align_center, a.justify_between]}>
      <Text
        style={[a.body_2_md_regular, {color: p.text_gray_low, flexShrink: 0}]}
      >
        {label}
      </Text>

      <View style={[a.flex_row, a.align_center, a.gap_sm, {flexShrink: 1}]}>
        <Text
          style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}
          numberOfLines={1}
        >
          {truncated}
        </Text>

        <Pressable
          onPress={handleCopy}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        >
          {isCopying ? (
            <Icon.CopySuccess size={24} color={p.gray_900} />
          ) : (
            <Icon.Copy size={24} color={p.gray_900} />
          )}
        </Pressable>
      </View>
    </View>
  )
}

const SocialMediaRow = ({url}: {url: string}) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_row, a.align_center, a.justify_between]}>
      <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
        Social media
      </Text>

      <Pressable onPress={() => Linking.openURL(url)}>
        <Text
          style={[
            a.body_2_md_regular,
            {color: p.primary_600, textDecorationLine: 'underline'},
          ]}
          numberOfLines={1}
        >
          {url}
        </Text>
      </Pressable>
    </View>
  )
}

type MetadataSectionsProps = {
  objectives: string
  motivations: string
  qualifications: string
}

const MetadataSections = ({
  objectives,
  motivations,
  qualifications,
}: MetadataSectionsProps) => {
  const hasSections = objectives || motivations || qualifications
  if (!hasSections) return null

  return (
    <View style={[a.gap_lg]}>
      {Boolean(objectives) && (
        <TextSection title="Objectives" body={objectives} />
      )}

      {Boolean(motivations) && (
        <TextSection title="Motivations" body={motivations} />
      )}

      {Boolean(qualifications) && (
        <TextSection title="Qualifications" body={qualifications} />
      )}
    </View>
  )
}

const TextSection = ({title, body}: {title: string; body: string}) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.gap_sm]}>
      <Text
        style={[
          a.body_1_lg_regular,
          {color: p.text_gray_medium, fontWeight: '500'},
        ]}
      >
        {title}
      </Text>

      <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
        {body}
      </Text>
    </View>
  )
}

const UnverifiedSection = () => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.gap_sm]}>
      <View style={[a.flex_row, a.align_center, a.justify_between]}>
        <Text
          style={[
            a.body_1_lg_regular,
            {color: p.text_gray_medium, fontWeight: '500'},
          ]}
        >
          Unverified DRep metadata
        </Text>

        <Icon.Info size={24} color={p.text_gray_medium} />
      </View>

      <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
        This information couldn't be verified against the blockchain and may
        have been altered. It has been hidden for your safety.
      </Text>
    </View>
  )
}
