/* eslint-disable @typescript-eslint/no-explicit-any */
import {useRoute} from '@react-navigation/native'
import {isNonNullable} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {fromPairs} from 'lodash'
import React, {useState} from 'react'
import {IntlShape, useIntl} from 'react-intl'
import {
  LayoutAnimation,
  Linking,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Banner} from '../../../../components/Banner/Banner'
import {Boundary} from '../../../../components/Boundary/Boundary'
import {Button} from '../../../../components/Button/Button'
import {CopyButton} from '../../../../components/CopyButton'
import {FadeIn} from '../../../../components/FadeIn'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {Text} from '../../../../components/Text'
import {isEmptyString} from '../../../../kernel/utils'
import {MultiToken} from '../../../../yoroi-wallets/cardano/MultiToken'
import {CardanoTypes} from '../../../../yoroi-wallets/cardano/types'
import {useTransactionInfos} from '../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../yoroi-wallets/types/other'
import {formatDateAndTime, formatTokenWithSymbol} from '../../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../../yoroi-wallets/utils/utils'
import {usePrivacyMode} from '../../../Settings/PrivacyMode/PrivacyMode'
import {useBestBlock} from '../../../WalletManager/common/hooks/useBestBlock'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {messages, useStrings} from '../../common/strings'
import AddressModal from './AddressModal/AddressModal'
import {AssetList} from './AssetList'

export const TxDetails = () => {
  const {openModal} = useModal()
  const screenHeight = useWindowDimensions().height
  const modalHeight = Math.min(screenHeight * 0.8, 650) // to include derivation path in case it is possible
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const intl = useIntl()
  const {id} = useRoute().params as Params
  const {wallet} = useSelectedWallet()
  const {
    selected: {network},
  } = useWalletManager()
  const explorers = wallet.networkManager.explorers
  const internalAddressIndex = fromPairs(wallet.internalAddresses.map((addr, i) => [addr, i]))
  const externalAddressIndex = fromPairs(wallet.externalAddresses.map((addr, i) => [addr, i]))
  const [expandedInItemId, setExpandedInItemId] = useState<null | ItemId>(null)
  const [expandedOutItemId, setExpandedOutItemId] = useState<null | ItemId>(null)
  const transactions = useTransactionInfos({wallet})
  const transaction = transactions[id]
  const memo = !isEmptyString(transaction.memo) ? transaction.memo : '-'

  const submittedAt = isNonNullable(transaction.submittedAt) ? formatDateAndTime(transaction.submittedAt, intl) : ''

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

  const openAddressModal = (address: string) =>
    openModal(strings.addessModalTitle, <AddressModal address={address} />, modalHeight)

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <FadeIn style={styles.fade}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Banner label={strings[transaction.direction]}>
            <Boundary>
              <AdaAmount amount={amount} />

              {txFee && <Fee amount={txFee} />}
            </Boundary>
          </Banner>

          <Label>{strings.memo}</Label>

          <Text secondary monospace>
            {memo}
          </Text>

          <View style={styles.borderTop}>
            <Text secondary monospace style={styles.center}>
              {submittedAt}
            </Text>

            <Label>{strings.fromAddresses}</Label>
          </View>

          {fromFiltered.map((item) => (
            <View key={item.id}>
              <AddressEntry {...item} showModalForAddress={openAddressModal} />

              {item.assets.length > 0 && (
                <TouchableOpacity
                  style={styles.assetsExpandable}
                  activeOpacity={0.5}
                  onPress={() => toggleExpandIn(item.id)}
                >
                  <Text style={styles.assetsTitle}>{` -${item.assets.length} ${strings.assetsLabel} `}</Text>

                  <Icon.Chevron
                    direction={expandedInItemId === item.id ? 'up' : 'down'}
                    color={colors.iconColor}
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
              <AddressEntry {...item} showModalForAddress={openAddressModal} />

              {item.assets.length > 0 && (
                <TouchableOpacity
                  style={styles.assetsExpandable}
                  activeOpacity={0.5}
                  onPress={() => toggleExpandOut(item.id)}
                >
                  <Text style={styles.assetsTitle}>{` +${item.assets.length} ${strings.assetsLabel} `}</Text>

                  <Icon.Chevron
                    direction={expandedOutItemId === item.id ? 'up' : 'down'}
                    color={colors.iconColor}
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

          <Boundary loading={{size: 'small'}}>
            <Confirmations transaction={transaction} />
          </Boundary>

          <Label>{strings.transactionId}</Label>

          <CopyButton title={transaction.id} value={transaction.id} />
        </ScrollView>

        {network !== Chain.Network.Sancho && (
          <Actions style={styles.borderTop}>
            <Button
              onPress={() => Linking.openURL(explorers.cardanoscan.tx(transaction.id))}
              title={strings.openInExplorer}
              shelleyTheme
            />
          </Actions>
        )}
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
    <Text secondary>
      {strings.confirmations(transaction.blockNumber === 0 ? 0 : bestBlock.height - transaction.blockNumber)}
    </Text>
  )
}

const Label = ({children}: {children: string}) => {
  const {styles} = useStyles()

  return <Text style={styles.label}>{children}</Text>
}

const AdaAmount = ({amount}: {amount: BigNumber}) => {
  const {wallet} = useSelectedWallet()
  const {styles} = useStyles()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const amountStyle = amount.gte(0) ? styles.positiveAmount : styles.negativeAmount

  if (isPrivacyActive) {
    return <Text style={amountStyle}>{privacyPlaceholder}</Text>
  }

  return <Text style={amountStyle}>{formatTokenWithSymbol(asQuantity(amount), wallet.portfolioPrimaryTokenInfo)}</Text>
}

const Fee = ({amount}: {amount: BigNumber}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  const text = `${strings.txDetailsFee} ${formatTokenWithSymbol(asQuantity(amount), wallet.portfolioPrimaryTokenInfo)}`
  return <Text small>{text}</Text>
}

const ExpandableAssetList: React.VFC<{
  expanded: boolean
  assets: CardanoTypes.TokenEntry[]
}> = ({expanded, assets}) => {
  return <View style={{borderWidth: 1, borderColor: 'transparent'}}>{expanded && <AssetList assets={assets} />}</View>
}

type AddressEntryProps = {
  address: string
  path: string
  isHighlighted: boolean
  showModalForAddress: (text: string) => void
}
const AddressEntry = ({address, path, isHighlighted, showModalForAddress}: AddressEntryProps) => {
  const {styles} = useStyles()
  const pathText = `(${path})`
  return (
    <>
      <RNText style={styles.path}>{pathText}</RNText>

      <TouchableOpacity activeOpacity={0.5} onPress={() => showModalForAddress(address)}>
        <RNText style={[styles.address, isHighlighted && styles.addressBold]}>{address}</RNText>
      </TouchableOpacity>
    </>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[{padding: 16}, style]} {...props} />

const getShownAddresses = (
  intl: IntlShape,
  transaction: TransactionInfo,
  internalAddressIndex: Record<string, number>,
  externalAddressIndex: Record<string, number>,
) => {
  const isMyReceive = (address: string) => externalAddressIndex[address] != null
  const isMyChange = (address: string) => internalAddressIndex[address] != null
  const isMyAddress = (address: string) => isMyReceive(address) || isMyChange(address)

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
  const toFiltered = toAddresses.filter(({address}) => (filterTo != null ? filterTo(address) : true))
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

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    fade: {
      ...atoms.flex_1,
    },
    contentContainer: {
      ...atoms.px_lg,
    },
    positiveAmount: {
      color: color.primary_600,
      fontWeight: '500',
    },
    negativeAmount: {
      color: color.sys_magenta_500,
      fontWeight: '500',
    },
    label: {
      ...atoms.pt_lg,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
      marginBottom: 8,
    },
    assetsExpandable: {
      ...atoms.pt_md,
      ...atoms.pb_xl,
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    assetsTitle: {
      ...atoms.body_2_md_regular,
      color: color.gray_900,
    },
    center: {
      ...atoms.pt_lg,
      ...atoms.self_center,
    },
    borderTop: {
      borderTopWidth: 1,
      borderColor: color.gray_200,
    },
    address: {
      color: color.text_gray_medium,
      ...atoms.body_2_md_regular,
    },
    addressBold: {
      ...atoms.body_2_md_medium,
    },
    path: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
  })

  const colors = {
    iconColor: color.gray_500,
  }

  return {styles, colors} as const
}
