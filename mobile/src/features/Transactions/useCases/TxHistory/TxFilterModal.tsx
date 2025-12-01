import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Checkbox} from '~/ui/Checkbox/Checkbox'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

type OperationType =
  | 'withdrawal'
  | 'collateralCreation'
  | 'stakingDelegated'
  | 'voteDelegation'
  | 'stakeUndelegation'
  | 'stakeRegistration'
  | 'stakeDeregistration'
  | 'stakeDelegation'
  | 'poolRegistration'
  | 'poolRetirement'
  | 'moveInstantaneousRewards'
  | 'drepRegistration'
  | 'drepDeregistration'
  | 'drepUpdate'
  | 'committeeHotAuth'
  | 'committeeColdResign'
  | 'genesisKeyDelegation'
  | 'burn'
  | 'mint'
  | 'swapCancel'
  | 'swap'
  | 'swapCreated'
  | 'swapResolved'
  | 'smartContract'
  | 'SENT'
  | 'RECEIVED'
  | 'SELF'
  | 'MULTI'

const OPERATION_TYPES: OperationType[] = [
  'withdrawal',
  'collateralCreation',
  'stakingDelegated',
  'voteDelegation',
  'stakeUndelegation',
  'stakeRegistration',
  'stakeDeregistration',
  'stakeDelegation',
  'poolRegistration',
  'poolRetirement',
  'moveInstantaneousRewards',
  'drepRegistration',
  'drepDeregistration',
  'drepUpdate',
  'committeeHotAuth',
  'committeeColdResign',
  'genesisKeyDelegation',
  'burn',
  'mint',
  'swapCancel',
  'swap',
  'swapCreated',
  'swapResolved',
  'smartContract',
  'SENT',
  'RECEIVED',
  'SELF',
  'MULTI',
]

const getOperationLabel = (
  operation: OperationType,
  strings: ReturnType<typeof useStrings>,
): string => {
  switch (operation) {
    case 'withdrawal':
      return strings.transactions.operation.withdrawal
    case 'collateralCreation':
      return strings.transactions.operation.collateralCreation
    case 'stakingDelegated':
      return strings.transactions.operation.stakingDelegated
    case 'voteDelegation':
      return strings.transactions.operation.voteDelegation
    case 'stakeUndelegation':
      return strings.transactions.operation.stakeUndelegation
    case 'stakeRegistration':
      return strings.transactions.operation.stakeRegistration
    case 'stakeDeregistration':
      return strings.transactions.operation.stakeDeregistration
    case 'stakeDelegation':
      return strings.transactions.operation.stakeDelegation
    case 'poolRegistration':
      return strings.transactions.operation.poolRegistration
    case 'poolRetirement':
      return strings.transactions.operation.poolRetirement
    case 'moveInstantaneousRewards':
      return strings.transactions.operation.moveInstantaneousRewards
    case 'drepRegistration':
      return strings.transactions.operation.drepRegistration
    case 'drepDeregistration':
      return strings.transactions.operation.drepDeregistration
    case 'drepUpdate':
      return strings.transactions.operation.drepUpdate
    case 'committeeHotAuth':
      return strings.transactions.operation.committeeHotAuth
    case 'committeeColdResign':
      return strings.transactions.operation.committeeColdResign
    case 'genesisKeyDelegation':
      return strings.transactions.operation.genesisKeyDelegation
    case 'burn':
      return strings.transactions.operation.burn
    case 'mint':
      return strings.transactions.operation.mint
    case 'swapCancel':
      return strings.transactions.operation.swapCancel
    case 'swap':
      return strings.transactions.operation.swap
    case 'swapCreated':
      return strings.transactions.operation.swapCreated
    case 'swapResolved':
      return strings.transactions.operation.swapResolved
    case 'smartContract':
      return strings.transactions.operation.smartContract
    case 'SENT':
      return strings.transactions.sent
    case 'RECEIVED':
      return strings.transactions.received
    case 'SELF':
      return strings.transactions.direction({direction: 'SELF'})
    case 'MULTI':
      return strings.transactions.direction({direction: 'MULTI'})
    default:
      return operation
  }
}

type Props = {
  onApply: (filters: {
    selectedOperations?: string[]
    metadataMemoSearch?: string
    minAdaMoved?: string
    maxAdaMoved?: string
  }) => void
  onClear: () => void
  initialFilters?: {
    selectedOperations?: string[]
    metadataMemoSearch?: string
    minAdaMoved?: string
    maxAdaMoved?: string
  }
}

export const TxFilterModal = ({
  onApply,
  onClear,
  initialFilters,
  onApplyRef,
  onClearRef,
}: Props & {
  onApplyRef?: React.MutableRefObject<(() => void) | null>
  onClearRef?: React.MutableRefObject<(() => void) | null>
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {closeModal} = useModal()

  const [selectedOperations, setSelectedOperations] = React.useState<string[]>(
    initialFilters?.selectedOperations ?? [],
  )
  const [metadataMemoSearch, setMetadataMemoSearch] = React.useState(
    initialFilters?.metadataMemoSearch ?? '',
  )
  const [minAdaMoved, setMinAdaMoved] = React.useState(
    initialFilters?.minAdaMoved ?? '',
  )
  const [maxAdaMoved, setMaxAdaMoved] = React.useState(
    initialFilters?.maxAdaMoved ?? '',
  )

  const toggleOperation = React.useCallback((operation: OperationType) => {
    setSelectedOperations((prev) => {
      if (prev.includes(operation)) {
        return prev.filter((op) => op !== operation)
      }
      return [...prev, operation]
    })
  }, [])

  const handleApply = React.useCallback(() => {
    onApply({
      selectedOperations:
        selectedOperations.length > 0 ? selectedOperations : undefined,
      metadataMemoSearch: metadataMemoSearch.trim() || undefined,
      minAdaMoved: minAdaMoved.trim() || undefined,
      maxAdaMoved: maxAdaMoved.trim() || undefined,
    })
    closeModal()
  }, [
    selectedOperations,
    metadataMemoSearch,
    minAdaMoved,
    maxAdaMoved,
    onApply,
    closeModal,
  ])

  const handleClear = React.useCallback(() => {
    setSelectedOperations([])
    setMetadataMemoSearch('')
    setMinAdaMoved('')
    setMaxAdaMoved('')
    onClear()
    closeModal()
  }, [onClear, closeModal])

  React.useEffect(() => {
    if (onApplyRef) {
      onApplyRef.current = handleApply
    }
    if (onClearRef) {
      onClearRef.current = handleClear
    }
  }, [handleApply, handleClear, onApplyRef, onClearRef])

  const normalizeAdaInput = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '')
    // Ensure only one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    return cleaned
  }

  const handleMinAdaChange = React.useCallback((text: string) => {
    setMinAdaMoved(normalizeAdaInput(text))
  }, [])

  const handleMaxAdaChange = React.useCallback((text: string) => {
    setMaxAdaMoved(normalizeAdaInput(text))
  }, [])

  return (
    <Modal.Content>
      <View style={[a.p_lg]}>
        <Text
          style={[a.heading_3_medium, {color: p.gray_900, marginBottom: 16}]}
        >
          {strings.transactions.filterOperations}
        </Text>

        <ScrollView style={{maxHeight: 200}} nestedScrollEnabled>
          {OPERATION_TYPES.map((operation) => (
            <Checkbox
              key={operation}
              checked={selectedOperations.includes(operation)}
              onChange={() => toggleOperation(operation)}
              text={getOperationLabel(operation, strings)}
            />
          ))}
        </ScrollView>

        <Space.Height.lg />

        <Text
          style={[a.heading_3_medium, {color: p.gray_900, marginBottom: 8}]}
        >
          {strings.transactions.filterMetadataMemo}
        </Text>
        <TextInput
          value={metadataMemoSearch}
          onChangeText={setMetadataMemoSearch}
          placeholder={strings.transactions.filterMetadataMemoPlaceholder}
        />

        <Space.Height.lg />

        <Text
          style={[a.heading_3_medium, {color: p.gray_900, marginBottom: 8}]}
        >
          {strings.transactions.filterAdaAmount}
        </Text>
        <View style={[a.flex_row, a.gap_sm]}>
          <View style={[a.flex_1]}>
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.gray_600, marginBottom: 4},
              ]}
            >
              {strings.transactions.filterMinAda}
            </Text>
            <TextInput
              value={minAdaMoved}
              onChangeText={handleMinAdaChange}
              placeholder="0"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[a.flex_1]}>
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.gray_600, marginBottom: 4},
              ]}
            >
              {strings.transactions.filterMaxAda}
            </Text>
            <TextInput
              value={maxAdaMoved}
              onChangeText={handleMaxAdaChange}
              placeholder="0"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>
    </Modal.Content>
  )
}

export const TxFilterModalFooter = ({
  onApply,
  onClear,
}: {
  onApply: () => void
  onClear: () => void
}) => {
  const strings = useStrings()

  return (
    <Modal.Footer>
      <View style={[a.flex_row, a.gap_sm, a.p_lg]}>
        <Button
          type="Secondary"
          title={strings.transactions.filterClear}
          onPress={onClear}
          style={[a.flex_1]}
        />
        <Button
          type="Primary"
          title={strings.transactions.filterApply}
          onPress={onApply}
          style={[a.flex_1]}
        />
      </View>
    </Modal.Footer>
  )
}
