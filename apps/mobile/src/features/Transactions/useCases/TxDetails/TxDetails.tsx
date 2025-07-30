import {useRoute} from '@react-navigation/native'
import {isNonNullable} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {fromPairs} from 'lodash'
import React, {useState} from 'react'
import {IntlShape, useIntl} from 'react-intl'
import {
  LayoutAnimation,
  Linking,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {messages, useStrings} from '~/features/Transactions/common/strings'
import {useBestBlock} from '~/features/WalletManager/hooks/useBestBlock'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Banner} from '~/ui/Banner/Banner'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Button} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {FadeIn} from '~/ui/FadeIn'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/ModalContext'
import {MultiToken} from '~/wallets/cardano/MultiToken'
import {CardanoTypes} from '~/wallets/cardano/types'
import {useTransactionInfos} from '~/wallets/hooks'
import {TransactionInfo} from '~/wallets/types/other'
import {formatDateAndTime, formatTokenWithSymbol} from '~/wallets/utils/format'
import {isEmptyString} from '~/wallets/utils/string'
import {asQuantity} from '~/wallets/utils/utils'
import AddressModal from './AddressModal/AddressModal'
import {AssetList} from './AssetList'

export const TxDetails = () => {
  const {openModal} = useModal()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 650) // to include derivation path in case it is possible
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const intl = useIntl()
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
  const memo = !isEmptyString(transaction.memo) ? transaction.memo : '-'

  const submittedAt = isNonNullable(transaction.submittedAt)
    ? formatDateAndTime(transaction.submittedAt, intl)
    : ''

  const {fromFiltered, toFiltered, cntOmittedTo} = getShownAddresses(
    intl,
    transaction,
    internalAddressIndex,
    externalAddressIndex,
  )
  const txFee =
    transaction.fee != null
      ? MultiToken.fromArray(transaction.fee).getDefault()
      : null
  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount = amountAsMT.getDefault()

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
      title: strings.addessModalTitle,
      content: <AddressModal address={address} />,
      height: modalHeight,
    })
  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <FadeIn style={a.flex_1}>
        <ScrollView contentContainerStyle={a.px_lg}>
          <Banner label={strings[transaction.direction]}>
            <Boundary>
              <AdaAmount amount={amount} />

              {txFee && <Fee amount={txFee} />}
            </Boundary>
          </Banner>

          <Label>{strings.memo}</Label>

          <Text>{memo}</Text>

          <View style={[{borderTopWidth: 1, borderColor: p.gray_200}]}>
            <Text style={[a.pt_lg, a.self_center]}>{submittedAt}</Text>

            <Label>{strings.fromAddresses}</Label>
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
                    style={[{color: p.gray_900}, a.body_2_md_regular]}
                  >{` -${item.assets.length} ${strings.assetsLabel} `}</Text>

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
            <Label>{strings.toAddresses}</Label>
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
                    style={[{color: p.gray_900}, a.body_2_md_regular]}
                  >{` +${item.assets.length} ${strings.assetsLabel} `}</Text>

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
            <Text>{strings.omittedCount(cntOmittedTo)}</Text>
          )}

          <View style={[{borderTopWidth: 1, borderColor: p.gray_200}]}>
            <Label>{strings.txAssuranceLevel}</Label>
          </View>

          <Boundary loading={{size: 'small'}}>
            <Confirmations transaction={transaction} />
          </Boundary>

          <Label>{strings.transactionId}</Label>

          <Copiable title={transaction.id} text={transaction.id} />
        </ScrollView>

        <Actions style={[{borderTopWidth: 1, borderColor: p.gray_200}]}>
          <Button
            onPress={() =>
              Linking.openURL(explorers.cardanoscan.tx(transaction.id))
            }
            title={strings.openInExplorer}
          />
        </Actions>
      </FadeIn>
    </SafeAreaView>
  )
}

const Confirmations = ({transaction}: {transaction: TransactionInfo}) => {
  const strings = useStrings()
  const bestBlock = useBestBlock({
    options: {
      refetchInterval: 5_000,
    },
  })

  return (
    <Text>
      {strings.confirmations(
        transaction.blockNumber === 0
          ? 0
          : bestBlock.height - transaction.blockNumber,
      )}
    </Text>
  )
}

const Label = ({children}: {children: string}) => {
  const {palette: p} = useTheme()

  return (
    <Text
      style={[
        a.pt_lg,
        a.body_2_md_regular,
        {color: p.text_gray_medium, marginBottom: 8},
      ]}
    >
      {children}
    </Text>
  )
}

const AdaAmount = ({amount}: {amount: BigNumber}) => {
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const amountStyle = amount.gte(0)
    ? {color: p.primary_600, fontWeight: '500'}
    : {color: p.sys_magenta_500, fontWeight: '500'}

  if (isPrivacyActive) {
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

  const text = `${strings.txDetailsFee} ${formatTokenWithSymbol(asQuantity(amount), wallet.portfolioPrimaryTokenInfo)}`
  return <Text>{text}</Text>
}

const ExpandableAssetList: React.VFC<{
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

const Actions = ({style, ...props}: ViewProps) => (
  <View style={[{padding: 16}, style]} {...props} />
)

const getShownAddresses = (
  intl: IntlShape,
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
      return intl.formatMessage(messages.addressPrefixReceive, {
        idx: externalAddressIndex[address],
      })
    } else if (isMyChange(address)) {
      return intl.formatMessage(messages.addressPrefixChange, {
        idx: internalAddressIndex[address],
      })
    } else {
      return intl.formatMessage(messages.addressPrefixNotMine)
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
