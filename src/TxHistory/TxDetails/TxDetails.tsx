/* eslint-disable @typescript-eslint/no-explicit-any */
import {useRoute} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import React, {useState} from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {LayoutAnimation, Linking, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import {Banner, Boundary, Button, CopyButton, Icon, OfflineBanner, StatusBar, Text} from '../../components'
import {useTipStatus, useTokenInfo} from '../../hooks'
import globalMessages from '../../i18n/global-messages'
import {formatTokenWithSymbol} from '../../legacy/format'
import {TransactionInfo} from '../../legacy/HistoryTransaction'
import {getNetworkConfigById} from '../../legacy/networks'
import {
  externalAddressIndexSelector,
  internalAddressIndexSelector,
  transactionsInfoSelector,
} from '../../legacy/selectors'
import {isEmptyString} from '../../legacy/utils'
import AddressModal from '../../Receive/AddressModal'
import Screen from '../../Screen'
import {useSelectedWallet} from '../../SelectedWallet'
import {brand, COLORS} from '../../theme'
import {TokenEntry} from '../../types'
import {MultiToken, YoroiWallet} from '../../yoroi-wallets'
import {AssetList} from './AssetList'
import assetListStyle from './AssetListTransaction.style'

export const TxDetails = () => {
  const strings = useStrings()
  const intl = useIntl()
  const {id} = useRoute().params as Params
  const internalAddressIndex = useSelector(internalAddressIndexSelector)
  const externalAddressIndex = useSelector(externalAddressIndexSelector)
  const wallet = useSelectedWallet()
  const transactions = useSelector(transactionsInfoSelector)
  const [expandedInItemId, setExpandedInItemId] = useState<null | ItemId>(null)
  const [expandedOutItemId, setExpandedOutItemId] = useState<null | ItemId>(null)
  const [addressDetail, setAddressDetail] = React.useState<null | string>(null)
  const transaction = transactions[id]

  const {fromFiltered, toFiltered, cntOmittedTo} = getShownAddresses(
    intl,
    transaction,
    internalAddressIndex,
    externalAddressIndex,
  )
  const txFee = transaction.fee ? MultiToken.fromArray(transaction.fee).getDefault() : null
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
    <View style={styles.container}>
      <StatusBar type="dark" />

      <OfflineBanner />
      <Screen scroll>
        <Banner label={strings[transaction.direction]}>
          <Boundary>
            <AdaAmount amount={amount} />
            {txFee && <Fee amount={txFee} />}
          </Boundary>
        </Banner>

        <View style={styles.content}>
          <Label>{strings.fromAddresses}</Label>
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
              <ExpandableAssetList expanded={expandedInItemId === item.id} assets={item.assets} />
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
              <ExpandableAssetList expanded={expandedOutItemId === item.id} assets={item.assets} />
            </View>
          ))}

          {cntOmittedTo > 0 && <Text>{strings.omittedCount(cntOmittedTo)}</Text>}
          <View style={styles.borderTop}>
            <Label>{strings.txAssuranceLevel}</Label>
          </View>
          <View>
            <Boundary loading={{fallbackProps: {size: 'small'}}}>
              <Confirmations transaction={transaction} wallet={wallet} />
            </Boundary>
            <Label>{strings.transactionId}</Label>
            <View style={styles.dataContainer}>
              <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
                {transaction.id}
              </Text>
              <CopyButton value={transaction.id} />
            </View>
            <Button onPress={() => openInExplorer(transaction, wallet.networkId)} title={strings.openInExplorer} />
          </View>
        </View>
      </Screen>

      {!isEmptyString(addressDetail) && (
        <AddressModal visible onRequestClose={() => setAddressDetail(null)} address={addressDetail} />
      )}
    </View>
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

const AdaAmount = ({amount}: {amount: BigNumber}) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})
  const amountStyle = amount.gte(0) ? styles.positiveAmount : styles.negativeAmount

  return <Text style={amountStyle}>{formatTokenWithSymbol(amount, tokenInfo)}</Text>
}

const Fee = ({amount}: {amount: BigNumber}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})

  return (
    <Text small>
      {strings.fee} {formatTokenWithSymbol(amount, tokenInfo)}
    </Text>
  )
}

const ExpandableAssetList: React.VFC<{expanded: boolean; assets: TokenEntry[]}> = ({
  expanded,
  assets,
}: {
  expanded: boolean
  assets: TokenEntry[]
}) => (
  <View style={{borderWidth: 1, borderColor: 'transparent'}}>
    {/* ↑↑↑ View wrapper fixes bug ↑↑↑ */}
    {expanded && <AssetList styles={assetListStyle} assets={assets} />}
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
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={() => showModalForAddress(address)}>
      <Text secondary bold={isHighlighted}>
        ({path}) {address}
      </Text>
    </TouchableOpacity>
  )
}

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

const openInExplorer = async (transaction: TransactionInfo, networkId: number) => {
  const networkConfig = getNetworkConfigById(networkId)
  await Linking.openURL(networkConfig.EXPLORER_URL_FOR_TX(transaction.id))
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
  content: {
    paddingHorizontal: 16,
  },
  positiveAmount: {
    color: COLORS.POSITIVE_AMOUNT,
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
