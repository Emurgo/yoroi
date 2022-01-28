import {useRoute} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import React, {useState} from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {Image, LayoutAnimation, Linking, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import assetListStyle from '../../../legacy/components/Common/MultiAsset/styles/AssetListTransaction.style'
import Screen from '../../../legacy/components/Screen'
import {Banner, Button, CopyButton, OfflineBanner, StatusBar, Text} from '../../../legacy/components/UiKit'
import {getNetworkConfigById} from '../../../legacy/config/networks'
import {MultiToken} from '../../../legacy/crypto/MultiToken'
import globalMessages from '../../../legacy/i18n/global-messages'
import {
  defaultNetworkAssetSelector,
  externalAddressIndexSelector,
  internalAddressIndexSelector,
  transactionsInfoSelector,
} from '../../../legacy/selectors'
import stylesConfig, {COLORS} from '../../../legacy/styles/config'
import {formatTokenWithSymbol} from '../../../legacy/utils/format'
import arrowDown from '../../assets/img/icon/chevron_down.png'
import arrowUp from '../../assets/img/icon/chevron_up.png'
import {useTokenInfos} from '../../hooks'
import AddressModal from '../../Receive/AddressModal'
import {useSelectedWallet} from '../../SelectedWallet'
import {Token, TransactionInfo} from '../../types/cardano'
import {AssetList} from './AssetList'

export type Params = {
  id: string
}

export const TxDetails = () => {
  const strings = useStrings()
  const intl = useIntl()
  const {id} = useRoute().params as Params
  const internalAddressIndex = useSelector(internalAddressIndexSelector)
  const externalAddressIndex = useSelector(externalAddressIndexSelector)
  const wallet = useSelectedWallet()
  const tokenInfos = useTokenInfos()
  const defaultNetworkAsset = useSelector(defaultNetworkAssetSelector)
  const transactions = useSelector(transactionsInfoSelector)
  const [expandedIn, setExpandedIn] = useState(false)
  const [expandedOut, setExpandedOut] = useState(false)
  const [addressDetail, setAddressDetail] = React.useState(null)
  const transaction = transactions[id]

  const showModalForAddress = (address) => {
    setAddressDetail(address)
  }

  const hideAddressModal = () => {
    setAddressDetail(null)
  }

  const {fromFiltered, toFiltered, cntOmittedTo} =
    transaction && getShownAddresses(intl, transaction, internalAddressIndex, externalAddressIndex)
  const txFee: BigNumber = transaction.fee ? MultiToken.fromArray(transaction.fee).getDefault() : null
  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount: BigNumber = amountAsMT.getDefault()
  const amountDefaultAsset: Token = tokenInfos[amountAsMT.getDefaultId()]

  const defaultAsset = amountDefaultAsset || defaultNetworkAsset

  const toggleExpandIn = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedIn(!expandedIn)
  }

  const toggleExpandOut = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedOut(!expandedOut)
  }

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      <OfflineBanner />
      <Screen scroll>
        <Banner label={strings[transaction.direction]}>
          <AdaAmount amount={amount} token={defaultAsset} />
          {txFee && (
            <Text small>
              {strings.fee} {formatTokenWithSymbol(txFee, defaultAsset)}
            </Text>
          )}
        </Banner>
        <View style={styles.content}>
          <Label>{strings.fromAddresses}</Label>
          {fromFiltered.map((item) => (
            <View key={item.address}>
              <AddressEntry {...item} showModalForAddress={showModalForAddress} />
              {item.assets.length > 0 && (
                <TouchableOpacity style={styles.assetsExpandable} activeOpacity={0.5} onPress={() => toggleExpandIn()}>
                  <Text style={styles.assetsTitle}>{` -${item.assets.length} ${strings.assetsLabel} `}</Text>
                  <Image source={expandedIn ? arrowUp : arrowDown} />
                </TouchableOpacity>
              )}
              {expandedIn && <AssetList styles={assetListStyle} assets={item.assets} assetsMetadata={tokenInfos} />}
            </View>
          ))}

          <View style={styles.borderTop}>
            <Label>{strings.toAddresses}</Label>
          </View>
          {toFiltered.map((item) => (
            <View key={item.address}>
              <AddressEntry {...item} showModalForAddress={showModalForAddress} />
              {item.assets.length > 0 && (
                <TouchableOpacity style={styles.assetsExpandable} activeOpacity={0.5} onPress={() => toggleExpandOut()}>
                  <Text style={styles.assetsTitle}>{` +${item.assets.length} ${strings.assetsLabel} `}</Text>
                  <Image source={expandedOut ? arrowUp : arrowDown} />
                </TouchableOpacity>
              )}
              {expandedOut && <AssetList styles={assetListStyle} assets={item.assets} assetsMetadata={tokenInfos} />}
            </View>
          ))}
          {cntOmittedTo > 0 && <Text>{strings.omittedCount(cntOmittedTo)}</Text>}
          <View style={styles.borderTop}>
            <Label>{strings.txAssuranceLevel}</Label>
          </View>
          <View>
            <Text secondary>{strings.confirmations(transaction.confirmations)}</Text>
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
      {addressDetail && (
        <AddressModal
          visible
          onRequestClose={hideAddressModal}
          address={addressDetail}
          onAddressVerify={hideAddressModal}
        />
      )}
    </View>
  )
}

const Label = ({children}: {children: string}) => <Text style={styles.label}>{children}</Text>

const AdaAmount = ({amount, token}: {amount: BigNumber; token: Token}) => {
  const amountStyle = amount.gte(0) ? styles.positiveAmount : styles.negativeAmount

  return <Text style={amountStyle}>{formatTokenWithSymbol(amount, token)}</Text>
}

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
  }[transaction.direction]

  // TODO(ppershing): decide on importance based on Tx direction
  const fromAddresses = _.uniq(transaction.inputs).map(({address, assets}) => ({
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedFrom(address),
  }))

  const toAddresses = _.uniq(transaction.outputs).map(({address, assets}) => ({
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedTo(address),
  }))
  const toFiltered = toAddresses.filter(({address}) => (filterTo ? filterTo(address) : true))
  const cntOmittedTo = toAddresses.length - toFiltered.length

  return {
    fromFiltered: fromAddresses,
    toFiltered,
    cntOmittedTo,
  }
}

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
    fontFamily: stylesConfig.defaultFont,
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

const openInExplorer = async (transaction: TransactionInfo, networkId: number) => {
  const networkConfig = getNetworkConfigById(networkId)
  await Linking.openURL(networkConfig.EXPLORER_URL_FOR_TX(transaction.id))
}
