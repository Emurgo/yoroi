import {isNonNullable} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'

import {useRoute} from '@react-navigation/native'
import {fromPairs} from 'lodash'
import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {
  LayoutAnimation,
  Linking,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'

import {usePrivacyMode} from '~/features/Settings/hooks/usePrivacyMode'
import {useTransactionInfos} from '~/features/Transactions/hooks/useTransactionInfos'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Banner} from '~/ui/Banner/Banner'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Button} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {CardanoTypes} from '~/wallets/cardano/types'
import {TransactionInfo} from '~/wallets/types/other'
import {formatDateAndTime, formatTokenWithSymbol} from '~/wallets/utils/format'
import {isEmptyString} from '~/wallets/utils/string'
import {Amounts, asQuantity} from '~/wallets/utils/utils'

import AddressModal from './AddressModal/AddressModal'
import {AssetList} from './AssetList'

export const TxDetails = () => {
  const {openModal} = useModal()
  const {scrollViewRef} = useScrollView()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 650)
  const strings = useStrings()
  const intl = useIntl()
  const {atoms: ta, palette: p} = useTheme()
  const {id} = useRoute().params as Params
  const {wallet} = useSelectedWallet()
  const explorers = wallet.networkManager.explorers
  const internalAddressIndex = fromPairs(
    wallet.internalAddresses.map((addr, i) => [addr, i]),
  )
  const externalAddressIndex = fromPairs(
    wallet.externalAddresses.map((addr, i) => [addr, i]),
  )
  const [expandedInItemId, setExpandedInItemId] = useState<null | ItemId>(null)
  const [expandedOutItemId, setExpandedOutItemId] = useState<null | ItemId>(
    null,
  )
  const transactions = useTransactionInfos({wallet})
  const transaction = transactions[id]

  if (!transaction) throw new App.Errors.InvalidState('TX selected is gone')
  const memo = !isEmptyString(transaction.memo) ? transaction.memo : '-'

  const submittedAt = isNonNullable(transaction.submittedAt)
    ? formatDateAndTime(transaction.submittedAt, intl)
    : ''

  const {fromFiltered, toFiltered, cntOmittedTo} = getShownAddresses(
    strings,
    transaction,
    internalAddressIndex,
    externalAddressIndex,
  )
  const txFee =
    transaction.fee != null
      ? new BigNumber(
          Amounts.getAmount(
            transaction.fee,
            wallet.portfolioPrimaryTokenInfo.id,
          ).quantity,
        )
      : null
  const amount = new BigNumber(
    Amounts.getAmount(
      transaction.amount,
      wallet.portfolioPrimaryTokenInfo.id,
    ).quantity,
  )

  const toggleExpandIn = (itemId: ItemId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedInItemId(expandedInItemId !== itemId ? itemId : null)
  }

  const toggleExpandOut = (itemId: ItemId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedOutItemId(expandedOutItemId !== itemId ? itemId : null)
  }

  const openAddressModal = (address: string) =>
    openModal({
      title: strings.transactions.addessModalTitle,
      content: <AddressModal address={address} />,
      height: modalHeight,
    })

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={a.px_lg} ref={scrollViewRef}>
        <Banner label={strings.transactions.direction(transaction.direction)}>
          <Boundary>
            <AdaAmount amount={amount} />

            {txFee && <Fee amount={txFee} />}
          </Boundary>
        </Banner>

        <Label>{strings.transactions.memo}</Label>

        <Text style={ta.text_gray_medium}>{memo}</Text>

        <View style={[{borderTopWidth: 1, borderColor: p.gray_200}]}>
          <Text style={[a.pt_lg, a.self_center, ta.text_gray_medium]}>
            {submittedAt}
          </Text>

          <Label>{strings.transactions.fromAddresses}</Label>
        </View>

        {fromFiltered.map((item) => (
          <View key={item.id}>
            <AddressEntry {...item} showModalForAddress={openAddressModal} />

            {item.assets.length > 0 && (
              <TouchableOpacity
                style={[
                  a.pt_md,
                  a.pb_xl,
                  a.flex_row,
                  a.justify_between,
                  a.align_center,
                ]}
                activeOpacity={0.5}
                onPress={() => toggleExpandIn(item.id)}
              >
                <Text
                  style={[ta.text_gray_max, a.body_2_md_regular]}
                >{` -${item.assets.length} ${strings.transactions.assetsLabel} `}</Text>

                <Icon.Chevron
                  direction={expandedInItemId === item.id ? 'up' : 'down'}
                  color={p.gray_500}
                  size={23}
                />
              </TouchableOpacity>
            )}

            <ExpandableAssetList
              expanded={expandedInItemId === item.id}
              assets={item.assets}
            />
          </View>
        ))}

        <View style={[{borderTopWidth: 1, borderColor: p.gray_200}]}>
          <Label>{strings.transactions.toAddresses}</Label>
        </View>

        {toFiltered.map((item) => (
          <View key={item.id}>
            <AddressEntry {...item} showModalForAddress={openAddressModal} />

            {item.assets.length > 0 && (
              <TouchableOpacity
                style={[
                  a.pt_md,
                  a.pb_xl,
                  a.flex_row,
                  a.justify_between,
                  a.align_center,
                ]}
                activeOpacity={0.5}
                onPress={() => toggleExpandOut(item.id)}
              >
                <Text
                  style={[ta.text_gray_max, a.body_2_md_regular]}
                >{` +${item.assets.length} ${strings.transactions.assetsLabel} `}</Text>

                <Icon.Chevron
                  direction={expandedOutItemId === item.id ? 'up' : 'down'}
                  color={p.gray_500}
                  size={23}
                />
              </TouchableOpacity>
            )}

            <ExpandableAssetList
              expanded={expandedOutItemId === item.id}
              assets={item.assets}
            />
          </View>
        ))}

        {cntOmittedTo > 0 && (
          <Text style={ta.text_gray_medium}>
            {strings.transactions.omittedCount(cntOmittedTo)}
          </Text>
        )}

        <View style={[{borderTopWidth: 1, borderColor: p.gray_200}]}>
          <Label>{strings.transactions.txAssuranceLevel}</Label>
        </View>

        <Label>{strings.transactions.transactionId}</Label>

        <Copiable title={transaction.id} text={transaction.id} />
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={() =>
            Linking.openURL(explorers.cardanoscan.tx(transaction.id))
          }
          title={strings.transactions.openInExplorer}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

const Label = ({children}: {children: string}) => {
  const {atoms: ta} = useTheme()

  return (
    <Text
      style={[
        a.pt_lg,
        a.body_2_md_regular,
        ta.text_gray_medium,
        {marginBottom: 8},
      ]}
    >
      {children}
    </Text>
  )
}

const AdaAmount = ({amount}: {amount: BigNumber}) => {
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()
  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()
  const amountStyle = amount.gte(0)
    ? {color: p.primary_600, fontWeight: '500' as const}
    : {color: p.sys_magenta_500, fontWeight: '500' as const}

  if (isPrivacyModeEnabled) {
    return <Text style={amountStyle}>{privacyPlaceholder}</Text>
  }

  return (
    <Text style={amountStyle}>
      {formatTokenWithSymbol(
        asQuantity(amount),
        wallet.portfolioPrimaryTokenInfo,
      )}
    </Text>
  )
}

const Fee = ({amount}: {amount: BigNumber}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {atoms: ta} = useTheme()

  const text = `${strings.transactions.txDetailsFee} ${formatTokenWithSymbol(asQuantity(amount), wallet.portfolioPrimaryTokenInfo)}`
  return <Text style={[ta.text_gray_medium, a.body_3_sm_regular]}>{text}</Text>
}

const ExpandableAssetList: React.FC<{
  expanded: boolean
  assets: CardanoTypes.TokenEntry[]
}> = ({expanded, assets}) => {
  return (
    <View style={{borderWidth: 1, borderColor: 'transparent'}}>
      {expanded && <AssetList assets={assets} />}
    </View>
  )
}

type AddressEntryProps = {
  address: string
  path: string
  isHighlighted: boolean
  showModalForAddress: (text: string) => void
}
const AddressEntry = ({
  address,
  path,
  isHighlighted,
  showModalForAddress,
}: AddressEntryProps) => {
  const {palette: p} = useTheme()
  const pathText = `(${path})`
  return (
    <>
      <Text style={[{color: p.text_gray_low}, a.body_2_md_regular]}>
        {pathText}
      </Text>

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => showModalForAddress(address)}
      >
        <Text
          style={[
            {color: p.text_gray_medium},
            a.body_2_md_regular,
            isHighlighted && a.body_2_md_medium,
          ]}
        >
          {address}
        </Text>
      </TouchableOpacity>
    </>
  )
}

const getShownAddresses = (
  strings: any,
  transaction: TransactionInfo,
  internalAddressIndex: Record<string, number>,
  externalAddressIndex: Record<string, number>,
) => {
  const isMyReceive = (address: string) => externalAddressIndex[address] != null
  const isMyChange = (address: string) => internalAddressIndex[address] != null
  const isMyAddress = (address: string) =>
    isMyReceive(address) || isMyChange(address)

  const getPath = (address: string) => {
    if (isMyReceive(address)) {
      return strings.transactions.addressPrefixReceive(
        externalAddressIndex[address],
      )
    } else if (isMyChange(address)) {
      return strings.transactions.addressPrefixChange(
        internalAddressIndex[address],
      )
    } else {
      return strings.transactions.addressPrefixNotMine
    }
  }

  const {isHighlightedFrom, isHighlightedTo, filterTo} = {
    SENT: {
      isHighlightedFrom: (_address: string) => false,
      isHighlightedTo: (address: string) => !isMyAddress(address),
      filterTo: null,
    },
    RECEIVED: {
      isHighlightedFrom: (_address: string) => false,
      isHighlightedTo: (address: string) => isMyAddress(address),
      filterTo: (address: string) => isMyAddress(address),
    },
    SELF: {
      isHighlightedFrom: (_address: string) => false,
      isHighlightedTo: (address: string) => !isMyChange(address),
      filterTo: null,
    },
    MULTI: {
      isHighlightedFrom: (address: string) => isMyAddress(address),
      isHighlightedTo: (address: string) => isMyAddress(address),
      filterTo: null,
    },
  }[transaction.direction] as any

  // TODO(ppershing): decide on importance based on Tx direction
  const fromAddresses = transaction.inputs.map(({address, assets}, index) => ({
    id: index,
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedFrom(address),
  }))

  const toAddresses = transaction.outputs.map(({address, assets}, index) => ({
    id: index,
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedTo(address),
  }))
  const toFiltered = toAddresses.filter(({address}) =>
    filterTo != null ? filterTo(address) : true,
  )
  const cntOmittedTo = toAddresses.length - toFiltered.length

  return {
    fromFiltered: fromAddresses,
    toFiltered,
    cntOmittedTo,
  }
}

type Params = {
  id: string
}

type ItemId = number
