import {isLeft} from '@yoroi/common'
import {
  ActiveDRepEntry,
  governanceApiMaker,
  useDelegationCertificate,
  useGovernance,
  useStakingKeyState,
} from '@yoroi/staking'
import {atoms as a, fontSize, useTheme} from '@yoroi/theme'
import {NotEnoughMoneyToSendError} from '@yoroi/tx'
import {Chain, Explorers} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useQuery} from '@tanstack/react-query'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import {explorerManager} from '@yoroi/explorers'
import {formatDrepHashToCIP129Format} from '~/features/Staking/Governance/common/drep'
import {useNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {useGovernanceVoteFlow} from '~/features/Staking/Governance/common/useGovernanceVoteFlow'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

// ── Types ────────────────────────────────────────────────────────────────────

type DRepDisplay = ActiveDRepEntry & {bech32Id: string}

type SortMethod =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'voting-power-asc'
  | 'voting-power-desc'
  | 'registered-asc'
  | 'registered-desc'
  | 'delegators-asc'
  | 'delegators-desc'
  | 'random'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatADA = (lovelace: number): string => {
  const ada = lovelace / 1_000_000
  if (ada >= 1_000_000_000) return `\u20B3 ${(ada / 1_000_000_000).toFixed(2)}B`
  if (ada >= 1_000_000) return `\u20B3 ${(ada / 1_000_000).toFixed(2)}M`
  if (ada >= 1_000) return `\u20B3 ${(ada / 1_000).toFixed(2)}K`
  return `\u20B3 ${ada.toFixed(2)}`
}

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays < 1) return 'today'
  if (diffDays < 30) return `${diffDays}d ago`
  const totalMonths = Math.floor(diffDays / 30)
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (years > 0 && months > 0) return `${years}y ${months}mo ago`
  if (years > 0) return `${years}y ago`
  return `${totalMonths}mo ago`
}

const sortDreps = (dreps: DRepDisplay[], method: SortMethod): DRepDisplay[] => {
  if (method === 'random') {
    return [...dreps].sort(() => Math.random() - 0.5)
  }
  const sorted = [...dreps].sort((a, b) => {
    switch (method) {
      case 'alphabetical-asc':
      case 'alphabetical-desc':
        return a.name.localeCompare(b.name)
      case 'voting-power-asc':
      case 'voting-power-desc':
        return a.stake - b.stake
      case 'registered-asc':
      case 'registered-desc':
        return (
          new Date(a.registeredDate).getTime() -
          new Date(b.registeredDate).getTime()
        )
      case 'delegators-asc':
      case 'delegators-desc':
        return a.delegatorCount - b.delegatorCount
      default:
        return 0
    }
  })
  const descMethods: SortMethod[] = [
    'alphabetical-desc',
    'voting-power-desc',
    'registered-desc',
    'delegators-desc',
  ]
  return descMethods.includes(method) ? sorted.reverse() : sorted
}

const SORT_LABELS: Record<SortMethod, string> = {
  'alphabetical-asc': 'Alphabetical (A→Z)',
  'alphabetical-desc': 'Alphabetical (Z→A)',
  'voting-power-asc': 'Voting Power (Low→High)',
  'voting-power-desc': 'Voting Power (High→Low)',
  'registered-asc': 'Registered (Oldest first)',
  'registered-desc': 'Registered (Newest first)',
  'delegators-asc': 'Delegators (Low→High)',
  'delegators-desc': 'Delegators (High→Low)',
  'random': 'Random',
}

const PAGE_SIZE = 1000
const MAX_PAGES = 10

// ── Hook: fetch all active DReps ──────────────────────────────────────────────

const useActiveDreps = () => {
  const {wallet} = useSelectedWallet()
  const network = wallet.networkManager.network
  const api = React.useMemo(() => governanceApiMaker({network}), [network])

  return useQuery<DRepDisplay[], Error>({
    queryKey: ['activeDreps', network],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const all: ActiveDRepEntry[] = []
      let page = 1
      while (page <= MAX_PAGES) {
        const response = await api.getActiveDreps(page, PAGE_SIZE)
        if (isLeft(response)) throw new Error('Failed to fetch DRep list')
        const entries = response.value.data
        all.push(...entries)
        if (entries.length < PAGE_SIZE) break
        page++
      }
      return all.map((entry) => {
        const bech32Id = formatDrepHashToCIP129Format(
          entry.id,
          entry.from === 'verificationKey' ? 'key' : 'script',
        )
        return {
          ...entry,
          bech32Id,
          name: entry.name || bech32Id,
        }
      })
    },
  })
}

// ── Sort Picker ───────────────────────────────────────────────────────────────

type SortPickerProps = {
  value: SortMethod
  onChange: (method: SortMethod) => void
}

const SortPicker = ({value, onChange}: SortPickerProps) => {
  const {palette: p} = useTheme()
  const [visible, setVisible] = React.useState(false)

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={[
          a.flex_row,
          a.align_center,
          a.justify_between,
          a.rounded_sm,
          a.p_sm,
          {borderWidth: 1, borderColor: p.gray_400},
        ]}
        accessibilityRole="button"
      >
        <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
          {SORT_LABELS[value]}
        </Text>

        <Icon.Chevron size={20} color={p.text_gray_low} direction="down" />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={[
            a.flex_1,
            a.justify_end,
            {backgroundColor: 'rgba(0,0,0,0.4)'},
          ]}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              a.rounded_sm,
              a.p_lg,
              {backgroundColor: p.bg_color_max, margin: 16},
            ]}
          >
            {(Object.keys(SORT_LABELS) as SortMethod[]).map((method) => (
              <Pressable
                key={method}
                onPress={() => {
                  onChange(method)
                  setVisible(false)
                }}
                style={[
                  a.p_sm,
                  a.flex_row,
                  a.align_center,
                  a.justify_between,
                  {borderRadius: 8},
                ]}
              >
                <Text
                  style={[
                    a.body_1_lg_regular,
                    {
                      color:
                        method === value ? p.primary_500 : p.text_gray_medium,
                      fontWeight: method === value ? '600' : '400',
                    },
                  ]}
                >
                  {SORT_LABELS[method]}
                </Text>

                {method === value && (
                  <Icon.Check size={20} color={p.primary_500} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

// ── DRep Card ─────────────────────────────────────────────────────────────────

type DRepCardProps = {
  drep: DRepDisplay
  onDelegate: (drep: DRepDisplay) => void
  onDetails: (drep: DRepDisplay) => void
  isPending: boolean
  isCurrentlyDelegated?: boolean
  network: Chain.SupportedNetworks
}

const DRepCard = ({
  drep,
  onDelegate,
  onDetails,
  isPending,
  isCurrentlyDelegated = false,
  network,
}: DRepCardProps) => {
  const {palette: p} = useTheme()
  const strings = useDrepListStrings()
  const [imageError, setImageError] = React.useState(false)

  const showImage = Boolean(drep.imageUrl) && !imageError
  const gradientColors = isCurrentlyDelegated
    ? p.bg_gradient_2
    : ([p.bg_color_max, p.bg_color_max] as const)

  return (
    <LinearGradient
      start={{x: 1, y: 1}}
      end={{x: 0, y: 0}}
      colors={gradientColors}
      style={[a.rounded_sm, a.p_lg, a.border, {borderColor: p.gray_200}]}
    >
      {/* Avatar + Name */}
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <View
          style={[
            a.align_center,
            a.justify_center,
            a.rounded_full,
            {
              width: 48,
              height: 48,
              backgroundColor: p.bg_color_min,
              overflow: 'hidden',
            },
          ]}
        >
          {showImage ? (
            <Image
              source={{uri: drep.imageUrl}}
              style={{width: 48, height: 48, borderRadius: 24}}
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon.OtherDreps size={24} color={p.el_gray_medium} />
          )}
        </View>

        <Pressable
          onPress={() =>
            Linking.openURL(
              explorerManager[network][Explorers.Explorer.Cexplorer].drep(
                drep.bech32Id,
              ),
            )
          }
          style={{flex: 1}}
        >
          <Text
            style={[
              a.heading_4_medium,
              {color: p.primary_600, textDecorationLine: 'underline'},
            ]}
            numberOfLines={1}
          >
            {drep.name}
          </Text>
        </Pressable>
      </View>

      <Space.Height.sm />

      {/* Full bech32 ID */}
      <Text
        style={[a.body_2_md_regular, {color: p.text_gray_low}]}
        numberOfLines={2}
      >
        {drep.bech32Id}
      </Text>

      <Space.Height.sm />

      {/* Stats row labels */}
      <View style={[a.flex_row]}>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium, flex: 1}]}
        >
          {strings.delegators}
        </Text>

        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium, flex: 1}]}
        >
          {strings.votingPower}
        </Text>

        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium, flex: 1}]}
        >
          {strings.registered}
        </Text>
      </View>

      {/* Stats row values */}
      <View style={[a.flex_row]}>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_low, flex: 1}]}>
          {drep.delegatorCount.toLocaleString('en-US')}
        </Text>

        <Text style={[a.body_2_md_regular, {color: p.text_gray_low, flex: 1}]}>
          {formatADA(drep.stake)}
        </Text>

        <Text style={[a.body_2_md_regular, {color: p.text_gray_low, flex: 1}]}>
          {formatRelativeDate(drep.registeredDate)}
        </Text>
      </View>

      <Space.Height.md />

      {/* Action buttons */}
      <View style={[a.flex_row, a.gap_sm]}>
        <View style={{flex: 1}}>
          <Button
            title={strings.delegate}
            size="S"
            onPress={() => onDelegate(drep)}
            disabled={isPending || isCurrentlyDelegated}
          />
        </View>

        <View style={{flex: 1}}>
          <Button
            title={strings.details}
            type={ButtonType.Secondary}
            size="S"
            onPress={() => onDetails(drep)}
          />
        </View>
      </View>
    </LinearGradient>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export const DrepListScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const network = wallet.networkManager.network
  const {manager} = useGovernance()
  const navigateTo = useNavigateTo()
  const strings = useDrepListStrings()

  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash)
  const currentDelegatedId =
    stakingStatus?.drepDelegation?.action === 'drep'
      ? stakingStatus.drepDelegation.hash
      : null

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

  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortMethod, setSortMethod] =
    React.useState<SortMethod>('alphabetical-asc')

  const {data: allDreps, isLoading, error} = useActiveDreps()

  const filteredAndSorted = React.useMemo(() => {
    if (!allDreps) return []
    const q = searchQuery.trim().toLowerCase()
    const filtered = q
      ? allDreps.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.bech32Id.toLowerCase().includes(q) ||
            d.id.toLowerCase().includes(q),
        )
      : allDreps
    const sorted = sortDreps(filtered, sortMethod)
    if (!currentDelegatedId) return sorted
    const idx = sorted.findIndex((d) => d.id === currentDelegatedId)
    if (idx <= 0) return sorted
    const pinned = sorted[idx]!
    const rest = [...sorted.slice(0, idx), ...sorted.slice(idx + 1)]
    return [pinned, ...rest]
  }, [allDreps, searchQuery, sortMethod, currentDelegatedId])

  const handleDetails = React.useCallback(
    (drep: DRepDisplay) => {
      navigateTo.drepDetail({
        hexId: drep.id,
        bech32Id: drep.bech32Id,
        name: drep.name,
        imageUrl: drep.imageUrl,
        stake: drep.stake,
        delegatorCount: drep.delegatorCount,
        registeredDate: drep.registeredDate,
        metadataVerification: drep.metadataVerification,
        objectives: drep.objectives,
        motivations: drep.motivations,
        qualifications: drep.qualifications,
        socialMedia: drep.socialMedia,
        from: drep.from,
      })
    },
    [navigateTo],
  )

  const handleDelegate = React.useCallback(
    async (drep: DRepDisplay) => {
      if (isPending) return
      const stakingKey = wallet.getStakingKey()
      const type = drep.from === 'verificationKey' ? 'key' : 'script'

      const certificate = await createDelegationCertificate({
        hash: drep.id,
        type,
        stakingKey,
      })
      const stakeCert = needsToRegisterStakingKey
        ? manager.createStakeRegistrationCertificate(stakingKey)
        : null
      const certs =
        stakeCert !== null ? [stakeCert, certificate] : [certificate]

      submitDelegate(certs, {hash: drep.id, type, CIP105: false})
    },
    [
      isPending,
      wallet,
      createDelegationCertificate,
      needsToRegisterStakingKey,
      manager,
      submitDelegate,
    ],
  )

  if (isLoading) {
    return (
      <View
        style={[a.flex_1, a.align_center, a.justify_center, ta.bg_color_max]}
      >
        <ActivityIndicator size="large" color={p.primary_500} />
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={[
          a.flex_1,
          a.align_center,
          a.justify_center,
          a.px_lg,
          ta.bg_color_max,
        ]}
      >
        <Text
          style={[
            a.body_1_lg_regular,
            {color: p.sys_magenta_500},
            a.text_center,
          ]}
        >
          {strings.loadError}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
      {/* Search + Sort */}
      <View style={[a.px_lg, a.pt_sm, a.gap_sm]}>
        {/* Search input */}
        <View
          style={[
            a.flex_row,
            a.align_center,
            a.rounded_sm,
            a.gap_sm,
            a.p_sm,
            {borderWidth: 1, borderColor: p.gray_400},
          ]}
        >
          <Icon.Magnify size={20} color={p.text_gray_low} />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={strings.searchPlaceholder}
            placeholderTextColor={p.text_gray_low}
            style={[a.flex_1, a.font_normal, {color: p.text_gray_medium, fontSize: fontSize.sm}]}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            >
              <Icon.Cross size={20} color={p.text_gray_low} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort picker */}
        <SortPicker value={sortMethod} onChange={setSortMethod} />
      </View>

      <Space.Height.sm />

      {/* DRep list */}
      <FlatList
        data={filteredAndSorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[a.px_lg, a.pb_lg, a.gap_lg]}
        renderItem={({item}) => (
          <DRepCard
            drep={item}
            onDelegate={handleDelegate}
            onDetails={handleDetails}
            isPending={isPending}
            isCurrentlyDelegated={item.id === currentDelegatedId}
            network={network}
          />
        )}
        ListEmptyComponent={
          <View style={[a.align_center, a.justify_center, {paddingTop: 48}]}>
            <Text style={[a.body_1_lg_regular, {color: p.text_gray_low}]}>
              {strings.noResults}
            </Text>
          </View>
        }
      />
    </View>
  )
}

// ── Strings ───────────────────────────────────────────────────────────────────

const useDrepListStrings = () => ({
  searchPlaceholder: 'Search by Id or Name',
  delegate: 'DELEGATE',
  details: 'DETAILS',
  delegators: 'Delegators',
  votingPower: 'Voting power',
  registered: 'Registered',
  noResults: 'No DReps found',
  loadError: 'Failed to load DRep list. Please try again.',
})
