/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation, useRoute} from '@react-navigation/native'
import {isNonNullable} from '@yoroi/common'
import {BigNumber} from 'bignumber.js'
import {fromPairs} from 'lodash'
import React, {useEffect, useState} from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {LayoutAnimation, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Banner, Boundary, Button, CopyButton, FadeIn, Icon, StatusBar, Text} from '../../components'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import globalMessages from '../../i18n/global-messages'
import {formatDateAndTime, formatTokenWithSymbol} from '../../legacy/format'
import AddressModal from '../../Receive/AddressModal'
import {useSelectedWallet} from '../../SelectedWallet'
import {brand, COLORS} from '../../theme'
import {isEmptyString} from '../../utils/utils'
import {MultiToken} from '../../yoroi-wallets/cardano/MultiToken'
import {CardanoTypes, YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useTipStatus, useTransactionInfos} from '../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../yoroi-wallets/types'
import {asQuantity, openInExplorer} from '../../yoroi-wallets/utils'
import {AssetList} from './AssetList'
import assetListStyle from './AssetListTransaction.style'

export const TxDetails = () => {
  const strings = useStrings()
  const intl = useIntl()
  const {id} = useRoute().params as Params
  const wallet = useSelectedWallet()
  const internalAddressIndex = fromPairs(wallet.internalAddresses.map((addr, i) => [addr, i]))
  const externalAddressIndex = fromPairs(wallet.externalAddresses.map((addr, i) => [addr, i]))
  const [expandedInItemId, setExpandedInItemId] = useState<null | ItemId>(null)
  const [expandedOutItemId, setExpandedOutItemId] = useState<null | ItemId>(null)
  const [addressDetail, setAddressDetail] = React.useState<null | string>(null)
  const transactions = useTransactionInfos(wallet)
  const transaction = transactions[id]
  const {isPrivacyOff} = usePrivacyMode()
  const memo = !isEmptyString(transaction.memo) ? transaction.memo : '-'

  useTitle(isNonNullable(transaction.submittedAt) ? formatDateAndTime(transaction.submittedAt, intl) : '')

  const {fromFiltered, toFiltered, cntOmittedTo} = getShownAddresses(
    intl,
    transaction,
    internalAddressIndex,
    externalAddressIndex,
  )
  const txFee = transaction.fee != null ? MultiToken.fromArray(transaction.fee).getDefault() : null
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

  return (
    <FadeIn style={styles.container}>
      <StatusBar type="dark" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Banner label={strings[transaction.direction]}>
          <Boundary>
            <AdaAmount amount={amount} isPrivacyOff={isPrivacyOff} />

            {txFee && <Fee amount={txFee} />}
          </Boundary>
        </Banner>

        <Label>{strings.memo}</Label>

        <Text secondary monospace>
          {memo}
        </Text>

        <View style={styles.borderTop}>
          <Label>{strings.fromAddresses}</Label>
        </View>

        {fromFiltered.map((item) => (
          <View key={item.id}>
            <AddressEntry {...item} showModalForAddress={setAddressDetail} />

            {item.assets.length > 0 && (
              <TouchableOpacity
                style={styles.assetsExpandable}
                activeOpacity={0.5}
                onPress={() => toggleExpandIn(item.id)}
              >
                <Text style={styles.assetsTitle}>{` -${item.assets.length} ${strings.assetsLabel} `}</Text>

                <Icon.Chevron
                  direction={expandedInItemId === item.id ? 'up' : 'down'}
                  color={COLORS.ACTION_GRAY}
                  size={23}
                />
              </TouchableOpacity>
            )}

            <ExpandableAssetList
              isPrivacyOff={isPrivacyOff}
              expanded={expandedInItemId === item.id}
              assets={item.assets}
            />
          </View>
        ))}

        <View style={styles.borderTop}>
          <Label>{strings.toAddresses}</Label>
        </View>

        {toFiltered.map((item) => (
          <View key={item.id}>
            <AddressEntry {...item} showModalForAddress={setAddressDetail} />

            {item.assets.length > 0 && (
              <TouchableOpacity
                style={styles.assetsExpandable}
                activeOpacity={0.5}
                onPress={() => toggleExpandOut(item.id)}
              >
                <Text style={styles.assetsTitle}>{` +${item.assets.length} ${strings.assetsLabel} `}</Text>

                <Icon.Chevron
                  direction={expandedOutItemId === item.id ? 'up' : 'down'}
                  color={COLORS.ACTION_GRAY}
                  size={23}
                />
              </TouchableOpacity>
            )}

            <ExpandableAssetList
              isPrivacyOff={isPrivacyOff}
              expanded={expandedOutItemId === item.id}
              assets={item.assets}
            />
          </View>
        ))}

        {cntOmittedTo > 0 && <Text>{strings.omittedCount(cntOmittedTo)}</Text>}

        <View style={styles.borderTop}>
          <Label>{strings.txAssuranceLevel}</Label>
        </View>

        <Boundary loading={{size: 'small'}}>
          <Confirmations transaction={transaction} wallet={wallet} />
        </Boundary>

        <Label>{strings.transactionId}</Label>

        <View style={styles.dataContainer}>
          <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
            {transaction.id}
          </Text>

          <CopyButton value={transaction.id} />
        </View>
      </ScrollView>

      <Actions>
        <Button
          onPress={() => openInExplorer(transaction.id, wallet.networkId)}
          title={strings.openInExplorer}
          shelleyTheme
        />
      </Actions>

      {!isEmptyString(addressDetail) && (
        <AddressModal visible onRequestClose={() => setAddressDetail(null)} address={addressDetail} />
      )}
    </FadeIn>
  )
}

const Confirmations = ({transaction, wallet}: {transaction: TransactionInfo; wallet: YoroiWallet}) => {
  const strings = useStrings()
  const tipStatus = useTipStatus({
    wallet,
    options: {
      refetchInterval: 5000,
    },
  })

  return (
    <Text secondary>
      {strings.confirmations(transaction.blockNumber === 0 ? 0 : tipStatus.bestBlock.height - transaction.blockNumber)}
    </Text>
  )
}

const Label = ({children}: {children: string}) => <Text style={styles.label}>{children}</Text>

const AdaAmount = ({amount, isPrivacyOff}: {amount: BigNumber; isPrivacyOff?: boolean}) => {
  const wallet = useSelectedWallet()
  const amountStyle = amount.gte(0) ? styles.positiveAmount : styles.negativeAmount

  if (isPrivacyOff) {
    return <Text style={amountStyle}>*.******</Text>
  }

  return <Text style={amountStyle}>{formatTokenWithSymbol(asQuantity(amount), wallet.primaryToken)}</Text>
}

const Fee = ({amount}: {amount: BigNumber}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const text = `${strings.fee} ${formatTokenWithSymbol(asQuantity(amount), wallet.primaryToken)}`
  return <Text small>{text}</Text>
}

const ExpandableAssetList: React.VFC<{
  expanded: boolean
  assets: CardanoTypes.TokenEntry[]
  isPrivacyOff?: boolean
}> = ({expanded, assets, isPrivacyOff}) => (
  <View style={{borderWidth: 1, borderColor: 'transparent'}}>
    {/* ↑↑↑ View wrapper fixes bug ↑↑↑ */}

    {expanded && <AssetList isPrivacyOff={isPrivacyOff} styles={assetListStyle} assets={assets} />}

    {/* ↓↓↓ View wrapper fixes bug ↓↓↓ */}
  </View>
)

type AddressEntryProps = {
  address: string
  path: string
  isHighlighted: boolean
  showModalForAddress: (string) => void
}
const AddressEntry = ({address, path, isHighlighted, showModalForAddress}: AddressEntryProps) => {
  const text = `(${path}) ${address}`
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={() => showModalForAddress(address)}>
      <Text secondary bold={isHighlighted}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[{padding: 16}, style]} {...props} />

const getShownAddresses = (
  intl: IntlShape,
  transaction: TransactionInfo,
  internalAddressIndex: Record<string, number>,
  externalAddressIndex: Record<string, number>,
) => {
  const isMyReceive = (address) => externalAddressIndex[address] != null
  const isMyChange = (address) => internalAddressIndex[address] != null
  const isMyAddress = (address) => isMyReceive(address) || isMyChange(address)

  const getPath = (address) => {
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
      isHighlightedFrom: (_address) => false,
      isHighlightedTo: (address) => !isMyAddress(address),
      filterTo: null,
    },
    RECEIVED: {
      isHighlightedFrom: (_address) => false,
      isHighlightedTo: (address) => isMyAddress(address),
      filterTo: (address) => isMyAddress(address),
    },
    SELF: {
      isHighlightedFrom: (_address) => false,
      isHighlightedTo: (address) => !isMyChange(address),
      filterTo: null,
    },
    MULTI: {
      isHighlightedFrom: (address) => isMyAddress(address),
      isHighlightedTo: (address) => isMyAddress(address),
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
  const toFiltered = toAddresses.filter(({address}) => (filterTo != null ? filterTo(address) : true))
  const cntOmittedTo = toAddresses.length - toFiltered.length

  return {
    fromFiltered: fromAddresses,
    toFiltered,
    cntOmittedTo,
  }
}

export type Params = {
  id: string
}

type ItemId = number

const useStrings = () => {
  const intl = useIntl()

  return {
    fee: intl.formatMessage(messages.fee),
    fromAddresses: intl.formatMessage(messages.fromAddresses),
    toAddresses: intl.formatMessage(messages.toAddresses),
    memo: intl.formatMessage(messages.memo),
    transactionId: intl.formatMessage(messages.transactionId),
    txAssuranceLevel: intl.formatMessage(messages.txAssuranceLevel),
    confirmations: (cnt) => intl.formatMessage(messages.confirmations, {cnt}),
    omittedCount: (cnt) => intl.formatMessage(messages.omittedCount, {cnt}),
    openInExplorer: intl.formatMessage(messages.openInExplorer),
    SENT: intl.formatMessage(txTypeMessages.SENT),
    RECEIVED: intl.formatMessage(txTypeMessages.RECEIVED),
    SELF: intl.formatMessage(txTypeMessages.SELF),
    MULTI: intl.formatMessage(txTypeMessages.MULTI),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
  }
}

const txTypeMessages = defineMessages({
  SENT: {
    id: 'components.txhistory.txdetails.txTypeSent',
    defaultMessage: '!!!Sent funds',
  },
  RECEIVED: {
    id: 'components.txhistory.txdetails.txTypeReceived',
    defaultMessage: '!!!Received funds',
  },
  SELF: {
    id: 'components.txhistory.txdetails.txTypeSelf',
    defaultMessage: '!!!Intrawallet transaction',
  },
  MULTI: {
    id: 'components.txhistory.txdetails.txTypeMulti',
    defaultMessage: '!!!Multi-party transaction',
  },
})

const messages = defineMessages({
  addressPrefixReceive: {
    id: 'components.txhistory.txdetails.addressPrefixReceive',
    defaultMessage: '!!!/{idx}',
  },
  addressPrefixChange: {
    id: 'components.txhistory.txdetails.addressPrefixChange',
    defaultMessage: '!!!/change',
  },
  addressPrefixNotMine: {
    id: 'components.txhistory.txdetails.addressPrefixNotMine',
    defaultMessage: '!!!not mine',
  },
  fee: {
    id: 'components.txhistory.txdetails.fee',
    defaultMessage: '!!!Fee: ',
  },
  fromAddresses: {
    id: 'components.txhistory.txdetails.fromAddresses',
    defaultMessage: '!!!From Addresses',
  },
  toAddresses: {
    id: 'components.txhistory.txdetails.toAddresses',
    defaultMessage: '!!!To Addresses',
  },
  memo: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo',
  },
  transactionId: {
    id: 'components.txhistory.txdetails.transactionId',
    defaultMessage: '!!!Transaction ID',
  },
  txAssuranceLevel: {
    id: 'components.txhistory.txdetails.txAssuranceLevel',
    defaultMessage: '!!!Transaction assurance level',
  },
  confirmations: {
    id: 'components.txhistory.txdetails.confirmations',
    defaultMessage: '!!!{cnt} {cnt, plural, one {CONFIRMATION} other {CONFIRMATIONS}}',
  },
  omittedCount: {
    id: 'components.txhistory.txdetails.omittedCount',
    defaultMessage: '!!!+ {cnt} omitted {cnt, plural, one {address} other {addresses}}',
  },
  openInExplorer: {
    id: 'global.openInExplorer',
    defaultMessage: '!!!Open in explorer',
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  positiveAmount: {
    color: '#3154CB',
    fontWeight: '500',
  },
  negativeAmount: {
    color: COLORS.NEGATIVE_AMOUNT,
    fontWeight: '500',
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  assetsExpandable: {
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  assetsTitle: {
    fontSize: 14,
    fontFamily: brand.defaultFont,
    color: COLORS.TEXT_GRAY,
  },
  borderTop: {
    borderTopWidth: 1,
    borderColor: 'rgba(173, 174, 182, 0.3)',
  },
  dataContainer: {
    flexDirection: 'row',
    paddingRight: 70,
    marginBottom: 20,
  },
})

const useTitle = (text: string) => {
  const navigation = useNavigation()

  useEffect(() => navigation.setOptions({title: text}))
}
