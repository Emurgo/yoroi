// @flow

import React, {useState} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {
  View,
  Linking,
  TouchableOpacity,
  LayoutAnimation,
  Image,
} from 'react-native'
import _ from 'lodash'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {BigNumber} from 'bignumber.js'

import {
  transactionsInfoSelector,
  internalAddressIndexSelector,
  externalAddressIndexSelector,
  walletMetaSelector,
  tokenInfoSelector,
  defaultNetworkAssetSelector,
} from '../../selectors'
import {withNavigationTitle} from '../../utils/renderUtils'
import {formatTokenWithSymbol, formatDateToSeconds} from '../../utils/format'
import {Text, Button, OfflineBanner, Banner, StatusBar} from '../UiKit'
import Screen from '../../components/Screen'
import {getNetworkConfigById} from '../../config/networks'
import AddressModal from '../Receive/AddressModal'
import AssetList from '../Common/MultiAsset/AssetList'
import assetListStyle from '../Common/MultiAsset/styles/AssetListTransaction.style'
import {MultiToken} from '../../crypto/MultiToken'

import styles from './styles/TxDetails.style'

import arrowUp from '../../assets/img/chevron_up.png'
import arrowDown from '../../assets/img/chevron_down.png'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'
import {
  TRANSACTION_DIRECTION,
  type Token,
  type TransactionInfo,
  type DefaultAsset,
} from '../../types/HistoryTransaction'
import globalMessages from '../../i18n/global-messages'

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
    description: 'some desc',
  },
  MULTI: {
    id: 'components.txhistory.txdetails.txTypeMulti',
    defaultMessage: '!!!Multi-party transaction',
    description: 'some desc',
  },
})

const messages = defineMessages({
  addressPrefixReceive: {
    id: 'components.txhistory.txdetails.addressPrefixReceive',
    defaultMessage: '!!!/{idx}',
    description: 'some desc',
  },
  addressPrefixChange: {
    id: 'components.txhistory.txdetails.addressPrefixChange',
    defaultMessage: '!!!/change',
    description: 'some desc',
  },
  addressPrefixNotMine: {
    id: 'components.txhistory.txdetails.addressPrefixNotMine',
    defaultMessage: '!!!not mine',
    description: 'some desc',
  },
  fee: {
    id: 'components.txhistory.txdetails.fee',
    defaultMessage: '!!!Fee: ',
    description: 'some desc',
  },
  fromAddresses: {
    id: 'components.txhistory.txdetails.fromAddresses',
    defaultMessage: '!!!From Addresses',
    description: 'some desc',
  },
  toAddresses: {
    id: 'components.txhistory.txdetails.toAddresses',
    defaultMessage: '!!!To Addresses',
    description: 'some desc',
  },
  transactionId: {
    id: 'components.txhistory.txdetails.transactionId',
    defaultMessage: '!!!Transaction ID',
    description: 'some desc',
  },
  txAssuranceLevel: {
    id: 'components.txhistory.txdetails.txAssuranceLevel',
    defaultMessage: '!!!Transaction assurance level',
    description: 'some desc',
  },
  confirmations: {
    id: 'components.txhistory.txdetails.confirmations',
    defaultMessage:
      '!!!{cnt} {cnt, plural, one {CONFIRMATION} other {CONFIRMATIONS}}',
    description: 'some desc',
  },
  omittedCount: {
    id: 'components.txhistory.txdetails.omittedCount',
    defaultMessage:
      '!!!+ {cnt} omitted {cnt, plural, one {address} other {addresses}}',
  },
})

const Label = ({children}) => <Text style={styles.label}>{children}</Text>

const AdaAmount = ({amount, token}: {amount: BigNumber, token: Token}) => {
  const amountStyle = amount.gte(0)
    ? styles.positiveAmount
    : styles.negativeAmount

  return <Text style={amountStyle}>{formatTokenWithSymbol(amount, token)}</Text>
}

const AddressEntry = withHandlers({
  onPress:
    ({address, showModalForAddress}) =>
    () =>
      showModalForAddress(address),
})(({address, onPress, path, isHighlighted}) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <Text secondary bold={isHighlighted}>
        ({path}) {address}
      </Text>
    </TouchableOpacity>
  )
})

const getShownAddresses = (
  intl,
  transaction,
  internalAddressIndex,
  externalAddressIndex,
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
  const fromFiltered = fromAddresses.filter(({address}) =>
    filterFrom ? filterFrom(address) : true,
  )
  const cntOmittedFrom = fromAddresses.length - fromFiltered.length

  const toAddresses = _.uniq(transaction.outputs).map(({address, assets}) => ({
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedTo(address),
  }))
  const toFiltered = toAddresses.filter(({address}) =>
    filterTo ? filterTo(address) : true,
  )
  const cntOmittedTo = toAddresses.length - toFiltered.length

  return {
    fromFiltered,
    cntOmittedFrom,
    toFiltered,
    cntOmittedTo,
  }
}
type Props = {|
  intl: IntlShape,
  transaction: TransactionInfo,
  internalAddressIndex: Dict<number>,
  externalAddressIndex: Dict<number>,
  tokenMetadata: Dict<Token>,
  defaultNetworkAsset: DefaultAsset,
  openInExplorer: () => void,
  showModalForAddress: (string) => void,
  addressDetail: string | null,
  hideAddressModal: () => void,
|}
const TxDetails = ({
  intl,
  transaction,
  internalAddressIndex,
  externalAddressIndex,
  tokenMetadata,
  defaultNetworkAsset,
  openInExplorer,
  showModalForAddress,
  addressDetail,
  hideAddressModal,
}: Props) => {
  const {fromFiltered, cntOmittedFrom, toFiltered, cntOmittedTo} =
    getShownAddresses(
      intl,
      transaction,
      internalAddressIndex,
      externalAddressIndex,
    )
  const txFee: ?BigNumber = transaction.fee
    ? MultiToken.fromArray(transaction.fee).getDefault()
    : null
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
        <Banner
          label={intl.formatMessage(txTypeMessages[transaction.direction])}
        >
          <AdaAmount amount={amount} token={defaultAsset} />
          {txFee && (
            <Text small>
              {intl.formatMessage(messages.fee)}{' '}
              {formatTokenWithSymbol(txFee, defaultAsset)}
            </Text>
          )}
        </Banner>
        <View style={styles.content}>
          <Label>{intl.formatMessage(messages.fromAddresses)}</Label>
          {fromFiltered.map((item, i) => (
            <>
              <AddressEntry
                key={i}
                {...item}
                showModalForAddress={showModalForAddress}
              />
              {item.assets.length > 0 && (
                <TouchableOpacity
                  style={styles.assetsExpandable}
                  activeOpacity={0.5}
                  onPress={() => toggleExpandIn()}
                >
                  <Text style={styles.assetsTitle}>
                    {` -${item.assets.length} ` +
                      `${intl.formatMessage(globalMessages.assetsLabel)} `}
                  </Text>
                  <Image source={expandedIn ? arrowUp : arrowDown} />
                </TouchableOpacity>
              )}
              {expandedIn && (
                <AssetList
                  styles={assetListStyle}
                  assets={item.assets}
                  assetsMetadata={tokenMetadata}
                />
              )}
            </>
          ))}
          {cntOmittedFrom > 0 && (
            <Text>
              {intl.formatMessage(messages.omittedCount, {cnt: cntOmittedFrom})}
            </Text>
          )}

          <View style={styles.borderTop}>
            <Label>{intl.formatMessage(messages.toAddresses)}</Label>
          </View>
          {toFiltered.map((item, i) => (
            <>
              <AddressEntry
                key={i}
                {...item}
                showModalForAddress={showModalForAddress}
              />
              {item.assets.length > 0 && (
                <TouchableOpacity
                  style={styles.assetsExpandable}
                  activeOpacity={0.5}
                  onPress={() => toggleExpandOut()}
                >
                  <Text style={styles.assetsTitle}>
                    {` +${item.assets.length} ` +
                      `${intl.formatMessage(globalMessages.assetsLabel)} `}
                  </Text>
                  <Image source={expandedOut ? arrowUp : arrowDown} />
                </TouchableOpacity>
              )}
              {expandedOut && (
                <AssetList
                  styles={assetListStyle}
                  assets={item.assets}
                  assetsMetadata={tokenMetadata}
                />
              )}
            </>
          ))}
          {cntOmittedTo > 0 && (
            <Text>
              {intl.formatMessage(messages.omittedCount, {cnt: cntOmittedTo})}
            </Text>
          )}
          <View style={styles.borderTop}>
            <Label>{intl.formatMessage(messages.txAssuranceLevel)}</Label>
          </View>
          <View>
            <Text secondary>
              {intl.formatMessage(messages.confirmations, {
                cnt: transaction.confirmations,
              })}
            </Text>
            <Label>{intl.formatMessage(messages.transactionId)}</Label>
            <Button onPress={openInExplorer} title={transaction.id} />
          </View>
        </View>
      </Screen>
      {/* $FlowFixMe TODO: index does not exist in AddressModal props */}
      <AddressModal
        visible={!!addressDetail}
        onRequestClose={hideAddressModal}
        address={addressDetail}
        index={null}
      />
    </View>
  )
}

export default injectIntl(
  (compose(
    connect((state: State, {route}) => {
      return {
        transaction: transactionsInfoSelector(state)[route.params.id],
        internalAddressIndex: internalAddressIndexSelector(state),
        externalAddressIndex: externalAddressIndexSelector(state),
        walletMeta: walletMetaSelector(state),
        tokenMetadata: tokenInfoSelector(state),
        defaultNetworkAsset: defaultNetworkAssetSelector(state),
      }
    }),
    withNavigationTitle(({transaction}) =>
      formatDateToSeconds(transaction.submittedAt),
    ),
    withStateHandlers(
      {addressDetail: null},
      {
        setAddressDetail: () => (address) => ({
          addressDetail: address,
        }),
      },
    ),
    withHandlers({
      openInExplorer:
        ({transaction, walletMeta}) =>
        () => {
          if (transaction) {
            const networkConfig = getNetworkConfigById(walletMeta.networkId)
            // note: don't await on purpose
            Linking.openURL(networkConfig.EXPLORER_URL_FOR_TX(transaction.id))
          }
        },
      showModalForAddress:
        ({setAddressDetail}) =>
        (address) => {
          setAddressDetail(address)
        },
      hideAddressModal:
        ({setAddressDetail}) =>
        () => {
          setAddressDetail(null)
        },
    }),
  )(TxDetails): ComponentType<{|
    navigation: Navigation,
    route: any,
    intl: IntlShape,
  |}>),
)
