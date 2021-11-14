// @flow

import {useRoute} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, LayoutAnimation, Linking, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import arrowDown from '../../assets/img/chevron_down.png'
import arrowUp from '../../assets/img/chevron_up.png'
import Screen from '../../components/Screen'
import {getNetworkConfigById} from '../../config/networks'
import {MultiToken} from '../../crypto/MultiToken'
import globalMessages from '../../i18n/global-messages'
import {
  defaultNetworkAssetSelector,
  externalAddressIndexSelector,
  internalAddressIndexSelector,
  tokenInfoSelector,
  transactionsInfoSelector,
  walletMetaSelector,
} from '../../selectors'
import {type Token, TRANSACTION_DIRECTION} from '../../types/HistoryTransaction'
import {formatTokenWithSymbol} from '../../utils/format'
import AssetList from '../Common/MultiAsset/AssetList'
import assetListStyle from '../Common/MultiAsset/styles/AssetListTransaction.style'
import AddressModal from '../Receive/AddressModal'
import {Banner, Button, CopyButton, OfflineBanner, StatusBar, Text} from '../UiKit'
import styles from './styles/TxDetails.style'

export const TxDetails = () => {
  const intl = useIntl()
  const strings = useStrings()
  const route = (useRoute(): any)
  const transaction = useSelector(transactionsInfoSelector)[route.params.id]
  const internalAddressIndex = useSelector(internalAddressIndexSelector)
  const externalAddressIndex = useSelector(externalAddressIndexSelector)
  const walletMeta = useSelector(walletMetaSelector)
  const tokenMetadata = useSelector(tokenInfoSelector)
  const defaultNetworkAsset = useSelector(defaultNetworkAssetSelector)

  const [addressDetail, setAddressDetail] = React.useState(null)

  const openInExplorer = () => {
    if (transaction) {
      const networkConfig = getNetworkConfigById(walletMeta.networkId, walletMeta.provider)
      // note: don't await on purpose
      Linking.openURL(networkConfig.EXPLORER_URL_FOR_TX(transaction.id))
    }
  }

  const showModalForAddress = (address) => {
    setAddressDetail(address)
  }

  const hideAddressModal = () => {
    setAddressDetail(null)
  }

  const {fromFiltered, cntOmittedFrom, toFiltered, cntOmittedTo} =
    transaction && getShownAddresses(intl, transaction, internalAddressIndex, externalAddressIndex)
  const txFee: ?BigNumber = transaction.fee ? MultiToken.fromArray(transaction.fee).getDefault() : null
  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount: BigNumber = amountAsMT.getDefault()
  const amountDefaultAsset: ?Token = tokenMetadata[amountAsMT.getDefaultId()]

  const defaultAsset = amountDefaultAsset || defaultNetworkAsset

  const [expandedIn, setExpandedIn] = useState(false)
  const [expandedOut, setExpandedOut] = useState(false)

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
        <Banner label={intl.formatMessage(txTypeMessages[transaction.direction])}>
          <AdaAmount amount={amount} token={defaultAsset} />

          {txFee && (
            <Text small>
              {strings.fee} {formatTokenWithSymbol(txFee, defaultAsset)}
            </Text>
          )}
        </Banner>

        <View style={styles.content}>
          <Label>{intl.formatMessage(messages.fromAddresses)}</Label>
          {fromFiltered.map((item) => (
            <View key={item.address}>
              <AddressEntry {...item} showModalForAddress={showModalForAddress} />

              {item.assets.length > 0 && (
                <TouchableOpacity style={styles.assetsExpandable} activeOpacity={0.5} onPress={() => toggleExpandIn()}>
                  <Text style={styles.assetsTitle}>
                    {` -${item.assets.length} ${intl.formatMessage(globalMessages.assetsLabel)} `}
                  </Text>
                  <Image source={expandedIn ? arrowUp : arrowDown} />
                </TouchableOpacity>
              )}

              {expandedIn && <AssetList styles={assetListStyle} assets={item.assets} assetsMetadata={tokenMetadata} />}
            </View>
          ))}

          {cntOmittedFrom > 0 && <Text>{strings.omittedCount(cntOmittedFrom)}</Text>}

          <View style={styles.borderTop}>
            <Label>{intl.formatMessage(messages.toAddresses)}</Label>
          </View>

          {toFiltered.map((item) => (
            <View key={item.address}>
              <AddressEntry {...item} showModalForAddress={showModalForAddress} />

              {item.assets.length > 0 && (
                <TouchableOpacity style={styles.assetsExpandable} activeOpacity={0.5} onPress={() => toggleExpandOut()}>
                  <Text style={styles.assetsTitle}>
                    {` +${item.assets.length} ${intl.formatMessage(globalMessages.assetsLabel)} `}
                  </Text>
                  <Image source={expandedOut ? arrowUp : arrowDown} />
                </TouchableOpacity>
              )}

              {expandedOut && <AssetList styles={assetListStyle} assets={item.assets} assetsMetadata={tokenMetadata} />}
            </View>
          ))}

          {cntOmittedTo > 0 && <Text>{intl.formatMessage(messages.omittedCount, {cnt: cntOmittedTo})}</Text>}

          <View style={styles.borderTop}>
            <Label>{intl.formatMessage(messages.txAssuranceLevel)}</Label>
          </View>

          <View>
            <Text secondary>{strings.confirmations(transaction.confirmations)}</Text>

            <Label>{intl.formatMessage(messages.transactionId)}</Label>
            <View style={styles.dataContainer}>
              <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
                {transaction.id}
              </Text>
              <CopyButton value={transaction.id} />
            </View>

            <Button onPress={openInExplorer} title={intl.formatMessage(messages.openInExplorer)} />
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

const AdaAmount = ({amount, token}: {amount: BigNumber, token: Token}) => {
  const amountStyle = amount.gte(0) ? styles.positiveAmount : styles.negativeAmount

  return <Text style={amountStyle}>{formatTokenWithSymbol(amount, token)}</Text>
}

type AddressEntryProps = {
  address: any,
  path: any,
  isHighlighted: any,
  showModalForAddress: any,
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

const getShownAddresses = (intl, transaction, internalAddressIndex, externalAddressIndex) => {
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

  const {isHighlightedFrom, filterFrom, isHighlightedTo, filterTo} = {
    [TRANSACTION_DIRECTION.SENT]: {
      isHighlightedFrom: (_address) => false,
      filterFrom: null,
      isHighlightedTo: (address) => !isMyAddress(address),
      filterTo: null,
    },
    [TRANSACTION_DIRECTION.RECEIVED]: {
      isHighlightedFrom: (_address) => false,
      filterFrom: null,
      isHighlightedTo: (address) => isMyAddress(address),
      filterTo: (address) => isMyAddress(address),
    },
    [TRANSACTION_DIRECTION.SELF]: {
      isHighlightedFrom: (_address) => false,
      filterFrom: null,
      isHighlightedTo: (address) => !isMyChange(address),
      filterTo: null,
    },
    [TRANSACTION_DIRECTION.MULTI]: {
      isHighlightedFrom: (address) => isMyAddress(address),
      filterFrom: null,
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
  const fromFiltered = fromAddresses.filter(({address}) => (filterFrom ? filterFrom(address) : true))
  const cntOmittedFrom = fromAddresses.length - fromFiltered.length

  const toAddresses = _.uniq(transaction.outputs).map(({address, assets}) => ({
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedTo(address),
  }))
  const toFiltered = toAddresses.filter(({address}) => (filterTo ? filterTo(address) : true))
  const cntOmittedTo = toAddresses.length - toFiltered.length

  return {
    fromFiltered,
    cntOmittedFrom,
    toFiltered,
    cntOmittedTo,
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

const useStrings = () => {
  const intl = useIntl()

  return {
    direction: (direction: string) => intl.formatMessage(txTypeMessages[direction]),
    fee: intl.formatMessage(messages.fee),
    fromAddresses: intl.formatMessage(messages.fromAddresses),
    toAddresses: intl.formatMessage(messages.toAddresses),
    transactionId: intl.formatMessage(messages.transactionId),
    txAssuranceLevel: intl.formatMessage(messages.txAssuranceLevel),
    confirmations: (confirmationCount: number) => intl.formatMessage(messages.confirmations, {cnt: confirmationCount}),
    omittedCount: (omittedCount: number) => intl.formatMessage(messages.omittedCount, {cnt: omittedCount}),
    openInExplorer: intl.formatMessage(messages.openInExplorer),
  }
}
