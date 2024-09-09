import {useNavigation} from '@react-navigation/core'
import {NavigationState, useFocusEffect} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {isString} from '@yoroi/common'
import {useExplorers} from '@yoroi/explorers'
import {useSwap, useSwapOrdersByStatusOpen} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Buffer} from 'buffer'
import _ from 'lodash'
import React, {useRef} from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Alert, Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {
  Button,
  ExpandableInfoCard,
  ExpandableInfoCardSkeleton,
  Footer,
  HeaderWrapper,
  HiddenInfoWrapper,
  MainInfoWrapper,
  Spacer,
  Text,
  TokenIcon,
  useModal,
} from '../../../../../components'
import {Space} from '../../../../../components/Space/Space'
import {useLanguage} from '../../../../../kernel/i18n'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../kernel/navigation'
import {SubmitTxInsufficientCollateralError} from '../../../../../yoroi-wallets/cardano/api/errors'
import {convertBech32ToHex, getTransactionSigners} from '../../../../../yoroi-wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {createRawTxSigningKey, generateCIP30UtxoCbor} from '../../../../../yoroi-wallets/cardano/utils'
import {useTokenInfos, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {useSearch} from '../../../../Search/SearchContext'
import {getCollateralAmountInLovelace} from '../../../../Settings/ManageCollateral/helpers'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {ConfirmRawTx} from '../../../common/ConfirmRawTx/ConfirmRawTx'
import {Counter} from '../../../common/Counter/Counter'
import {EmptyOpenOrdersIllustration} from '../../../common/Illustrations/EmptyOpenOrdersIllustration'
import {LiquidityPool} from '../../../common/LiquidityPool/LiquidityPool'
import {useNavigateTo} from '../../../common/navigation'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {SwapInfoLink} from '../../../common/SwapInfoLink/SwapInfoLink'
import {getCancellationOrderFee} from './helpers'
import {mapOpenOrders, MappedOpenOrder} from './mapOrders'

export const OpenOrders = () => {
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const strings = useStrings()
  const {styles} = useStyles()
  const intl = useIntl()
  const {wallet, meta} = useSelectedWallet()
  const {order: swapApiOrder} = useSwap()
  const {navigateToTxHistory} = useWalletNavigation()
  const [isLoading, setIsLoading] = React.useState(false)

  const orders = useSwapOrdersByStatusOpen()
  const {numberLocale} = useLanguage()
  const tokenIds = React.useMemo(() => _.uniq(orders?.flatMap((o) => [o.from.tokenId, o.to.tokenId])), [orders])
  const transactionsInfos = useTransactionInfos({wallet})
  const explorers = useExplorers(wallet.networkManager.network)
  // TODO: revisit
  const tokenInfos = useTokenInfos({wallet, tokenIds}) as unknown as Portfolio.Token.Info[]
  const normalizedOrders = React.useMemo(
    () => mapOpenOrders(orders, tokenInfos, numberLocale, Object.values(transactionsInfos), explorers.cardanoscan),
    [orders, tokenInfos, numberLocale, transactionsInfos, explorers.cardanoscan],
  )
  const navigationRef = useRef<NavigationState | null>(null)

  const {closeModal, openModal, isOpen: isModalOpen} = useModal()
  const modalOpenRef = useRef(isModalOpen)
  modalOpenRef.current = isModalOpen

  const {search, visible: isSearchBarVisible} = useSearch()

  const filteredOrders = React.useMemo(
    () =>
      normalizedOrders.filter((order) => {
        const searchLower = search.toLocaleLowerCase()
        return (
          order.assetFromLabel.toLocaleLowerCase().includes(searchLower) ||
          order.assetToLabel.toLocaleLowerCase().includes(searchLower)
        )
      }),
    [normalizedOrders, search],
  )

  const {track} = useMetrics()

  const navigation = useNavigation()

  const trackSwapConfirmPageViewed = React.useCallback(() => {
    // Closing a modal triggers this callback.
    // https://github.com/Emurgo/yoroi/pull/2913
    const currentState = navigation.getState()
    const previousState = navigationRef.current
    if (currentState === previousState) return
    track.swapConfirmedPageViewed({swap_tab: 'Open Orders'})
    navigationRef.current = currentState
  }, [track, navigation])

  useFocusEffect(trackSwapConfirmPageViewed)

  const trackCancellationSubmitted = (order: MappedOpenOrder) => {
    track.swapCancelationSubmitted({
      from_amount: Number(order.from.quantity) ?? 0,
      to_amount: Number(order.to.quantity) ?? 0,
      from_asset: [
        {
          asset_name: order.fromTokenInfo?.name ?? '',
          asset_ticker: order.fromTokenInfo?.ticker ?? '',
          policy_id: order.fromTokenInfo?.id.split('.')[0] ?? '',
        },
      ],
      to_asset: [
        {
          asset_name: order.toTokenInfo?.name ?? '',
          asset_ticker: order.toTokenInfo?.ticker ?? '',
          policy_id: order.toTokenInfo?.id.split('.')[0] ?? '',
        },
      ],
      pool_source: order.provider ?? '',
    })
  }

  const onRawTxConfirm = async (rootKey: string, order: MappedOpenOrder) => {
    try {
      const tx = await createCancellationTxAndSign(order.id, rootKey)
      if (!tx) return
      await wallet.submitTransaction(tx.txBase64)
      trackCancellationSubmitted(order)
      closeModal()
      navigateToTxHistory()
    } catch (error) {
      if (error instanceof SubmitTxInsufficientCollateralError) {
        handleCollateralError()
        return
      }
      throw error
    }
  }

  const onRawTxHwConfirm = (order: MappedOpenOrder) => {
    try {
      trackCancellationSubmitted(order)
      closeModal()
      navigateToTxHistory()
    } catch (error) {
      if (error instanceof SubmitTxInsufficientCollateralError) {
        handleCollateralError()
        return
      }
      throw error
    }
  }

  const showCollateralNotFoundAlert = useShowCollateralNotFoundAlert(wallet)

  const hasCollateral = () => {
    const collateral = wallet.getCollateralInfo()
    return !!collateral.utxo && collateral.amount.quantity >= BigInt(getCollateralAmountInLovelace())
  }

  const onOrderCancelConfirm = (order: MappedOpenOrder) => {
    if (!isString(order.utxo) || !isString(order.owner)) return

    if (!hasCollateral()) {
      handleCollateralError()
      return
    }

    openModal(
      strings.signTransaction,
      <ConfirmRawTx
        cancelOrder={swapApiOrder.cancel}
        utxo={order.utxo}
        bech32Address={order.owner}
        onCancel={closeModal}
        onConfirm={(rootKey) => onRawTxConfirm(rootKey, order)}
        onHWConfirm={() => onRawTxHwConfirm(order)}
      />,
      400,
    )
  }

  const handleCollateralError = () => {
    if (modalOpenRef.current) {
      closeModal()
    }

    showCollateralNotFoundAlert()
  }

  const getCollateralUtxo = async () => {
    const collateralInfo = wallet.getCollateralInfo()
    const utxo = collateralInfo.utxo

    if (!utxo) {
      throw new SubmitTxInsufficientCollateralError('Collateral utxo not found')
    }

    return generateCIP30UtxoCbor(utxo)
  }

  const createCancellationTxAndSign = async (
    orderId: string,
    rootKey: string,
  ): Promise<{txBase64: string} | undefined> => {
    const order = normalizedOrders.find((o) => o.id === orderId)
    if (!order || order.owner === undefined || order.utxo === undefined) return
    const {utxo, owner: bech32Address} = order

    try {
      const collateralUtxo = await getCollateralUtxo()
      const addressHex = await convertBech32ToHex(bech32Address)
      const cbor = await swapApiOrder.cancel({
        utxos: {collateral: collateralUtxo, order: utxo},
        address: addressHex,
      })
      const signers = await getTransactionSigners(cbor, wallet, meta)
      const keys = await Promise.all(signers.map(async (signer) => createRawTxSigningKey(rootKey, signer)))
      const response = await wallet.signRawTx(cbor, keys)
      if (!response) return
      const hexBase64 = Buffer.from(response).toString('base64')
      return {txBase64: hexBase64}
    } catch (error) {
      if (error instanceof SubmitTxInsufficientCollateralError) {
        handleCollateralError()
        return
      }
      throw error
    }
  }

  const {
    order: {cancel: cancelOrder},
  } = useSwap()

  const getFee = React.useCallback(
    async (utxo: string, collateralUtxo: string, bech32Address: string) => {
      setIsLoading(true)
      const fee = await getCancellationOrderFee(wallet, cancelOrder, {orderUtxo: utxo, collateralUtxo, bech32Address})
      setIsLoading(false)
      return fee
    },
    [cancelOrder, wallet],
  )

  const openCancellationModal = async (order: MappedOpenOrder) => {
    if (order.owner === undefined || order.utxo === undefined) return
    if (!hasCollateral()) {
      handleCollateralError()
      return
    }

    const {
      utxo,
      owner: bech32Address,
      fromTokenAmount,
      fromTokenInfo,
      toTokenInfo,
      assetFromLabel,
      assetToLabel,
      tokenPrice,
      tokenAmount,
    } = order
    const totalReturned = `${fromTokenAmount} ${fromTokenInfo?.ticker ?? fromTokenInfo?.name}`
    const collateralUtxo = await getCollateralUtxo()

    try {
      const fee = await getFee(utxo, collateralUtxo, bech32Address)
      openModal(
        strings.listOrdersSheetTitle,
        <ModalContent
          assetFromIcon={<TokenIcon wallet={wallet} tokenId={fromTokenInfo?.id ?? ''} variant="swap" />}
          assetToIcon={<TokenIcon wallet={wallet} tokenId={toTokenInfo?.id ?? ''} variant="swap" />}
          onConfirm={() => onOrderCancelConfirm(order)}
          onBack={closeModal}
          assetFromLabel={assetFromLabel}
          assetToLabel={assetToLabel}
          assetAmount={`${tokenAmount} ${assetToLabel}`}
          assetPrice={`${tokenPrice} ${assetFromLabel}/${assetToLabel}`}
          totalReturned={totalReturned}
          fee={fee}
        />,
        460,
      )
    } catch (error) {
      setIsLoading(false)
      if (error instanceof SubmitTxInsufficientCollateralError) {
        handleCollateralError()
        return
      }
      if (error instanceof Error) {
        Alert.alert(strings.generalErrorTitle, strings.generalErrorMessage(error.message))
      } else {
        Alert.alert(strings.generalErrorTitle, strings.generalErrorMessage(JSON.stringify(error)))
      }
    }
  }

  return (
    <>
      <View style={styles.container}>
        <FlashList
          data={filteredOrders}
          contentContainerStyle={styles.list}
          renderItem={({item: order}: {item: MappedOpenOrder}) => {
            const fromIcon = <TokenIcon wallet={wallet} tokenId={order.fromTokenInfo?.id ?? ''} variant="swap" />
            const toIcon = <TokenIcon wallet={wallet} tokenId={order.toTokenInfo?.id ?? ''} variant="swap" />
            const liquidityPoolIcon =
              order.provider !== undefined ? <PoolIcon size={28} providerId={order.provider} /> : null
            const expanded = order.id === hiddenInfoOpenId
            const date = new Date(order.date)
            return (
              <ExpandableInfoCard
                key={order.id}
                info={
                  <HiddenInfo
                    txId={order.txId}
                    total={`${order.total} ${order.assetFromLabel}`}
                    txLink={order.txLink}
                    liquidityPoolIcon={liquidityPoolIcon}
                    liquidityPoolName={order.provider ?? ''}
                    poolUrl={order.poolUrl ?? ''}
                  />
                }
                expanded={expanded}
                header={
                  <Header
                    onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== order.id ? order.id : null)}
                    assetFromLabel={order.assetFromLabel}
                    assetToLabel={order.assetToLabel}
                    assetFromIcon={fromIcon}
                    assetToIcon={toIcon}
                    expanded={expanded}
                  />
                }
                footer={
                  <Footer
                    disabled={!isString(order.utxo) || !isString(order.owner)}
                    onPress={() => openCancellationModal(order)}
                  >
                    {strings.listOrdersSheetButtonText.toLocaleUpperCase()}
                  </Footer>
                }
              >
                <MainInfo
                  tokenAmount={`${order.tokenAmount} ${order.assetToLabel}`}
                  tokenPrice={`${order.tokenPrice} ${order.assetFromLabel}/${order.assetToLabel}`}
                  date={
                    isNaN(date.getTime())
                      ? ''
                      : intl.formatDate(date, {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                          hour12: false,
                        })
                  }
                />
              </ExpandableInfoCard>
            )
          }}
          keyExtractor={({id}) => `${id}`}
          testID="openOrdersList"
          estimatedItemSize={72}
          bounces={false}
          ListEmptyComponent={<ListEmptyComponent openOrders={filteredOrders} />}
        />
      </View>

      {!isSearchBarVisible && (
        <Counter
          style={styles.counter}
          openingText={strings.youHave}
          counter={filteredOrders?.length ?? 0}
          closingText={strings.listOpenOrders}
        />
      )}

      <LoadingOverlay animating={isLoading} />
    </>
  )
}

const LoadingOverlay = ({animating}: {animating: boolean}) => {
  const {styles} = useStyles()
  const {isDark} = useTheme()

  if (!animating) return null

  return (
    <View style={[StyleSheet.absoluteFill, styles.loading]}>
      <ActivityIndicator animating={animating} size="large" color={isDark ? 'white' : 'black'} />
    </View>
  )
}

const Header = ({
  assetFromLabel,
  assetToLabel,
  assetFromIcon,
  assetToIcon,
  expanded,
  onPress,
}: {
  assetFromLabel: string
  assetToLabel: string
  assetFromIcon: React.ReactNode
  assetToIcon: React.ReactNode
  expanded?: boolean
  onPress: () => void
}) => {
  const {styles} = useStyles()
  return (
    <HeaderWrapper expanded={expanded} onPress={onPress}>
      <View style={styles.label}>
        {assetFromIcon}

        <Spacer width={4} />

        <Text style={styles.headerLabel}>{assetFromLabel}</Text>

        <Text style={styles.headerLabel}>/</Text>

        <Spacer width={4} />

        {assetToIcon}

        <Spacer width={4} />

        <Text style={styles.headerLabel}>{assetToLabel}</Text>
      </View>
    </HeaderWrapper>
  )
}

const HiddenInfo = ({
  total,
  liquidityPoolIcon,
  liquidityPoolName,
  poolUrl,
  txId,
  txLink,
}: {
  total: string
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  poolUrl: string
  txId: string
  txLink: string
}) => {
  const shortenedTxId = `${txId.substring(0, 9)}...${txId.substring(txId.length - 4, txId.length)}`
  const strings = useStrings()
  return (
    <View>
      {[
        {
          label: strings.listOrdersTotal,
          value: total,
        },
        {
          label: strings.dex.toLocaleUpperCase(),
          value: (
            <LiquidityPool
              liquidityPoolIcon={liquidityPoolIcon}
              liquidityPoolName={liquidityPoolName}
              poolUrl={poolUrl}
            />
          ),
        },

        {
          label: strings.listOrdersTxId,
          value: <TxLink txId={shortenedTxId} txLink={txLink} />,
        },
      ].map((item) => (
        <HiddenInfoWrapper key={item.label} value={item.value} label={item.label} />
      ))}
    </View>
  )
}

const MainInfo = ({tokenPrice, tokenAmount, date}: {tokenPrice: string; tokenAmount: string; date: string}) => {
  const strings = useStrings()
  const orderInfo = [
    {label: strings.listOrdersSheetAssetPrice, value: tokenPrice},
    {label: strings.listOrdersSheetAssetAmount, value: tokenAmount},
    {
      label: strings.listOrdersTimeCreated,
      value: date,
    },
  ]
  return (
    <View>
      {orderInfo.map((item, index) =>
        item.value === '' ? null : (
          <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === orderInfo.length - 1} />
        ),
      )}
    </View>
  )
}

const TxLink = ({txLink, txId}: {txLink: string; txId: string}) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity onPress={() => Linking.openURL(txLink)} style={styles.txLink}>
      <Text style={styles.txLinkText}>{txId}</Text>
    </TouchableOpacity>
  )
}

export const OpenOrdersSkeleton = () => {
  const {styles} = useStyles()
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {[0, 1, 2, 3].map((index) => (
          <React.Fragment key={index}>
            <ExpandableInfoCardSkeleton />

            <Spacer height={20} />
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

const ModalContent = ({
  onConfirm,
  onBack,
  assetFromIcon,
  assetFromLabel,
  assetToIcon,
  assetToLabel,
  assetPrice,
  assetAmount,
  totalReturned,
  fee,
}: {
  onConfirm: () => void
  onBack: () => void
  assetFromIcon: React.ReactNode
  assetFromLabel: string
  assetToLabel: string
  assetToIcon: React.ReactNode
  assetPrice: string
  assetAmount: string
  totalReturned: string
  fee: string
}) => {
  const strings = useStrings()
  const {styles} = useStyles()

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <View style={styles.modalRoot}>
      <ModalContentHeader
        assetFromIcon={assetFromIcon}
        assetFromLabel={assetFromLabel}
        assetToIcon={assetToIcon}
        assetToLabel={assetToLabel}
      />

      <Spacer height={10} />

      <ModalContentRow label={strings.listOrdersSheetAssetPrice} value={assetPrice} />

      <Spacer height={10} />

      <ModalContentRow label={strings.listOrdersSheetAssetAmount} value={assetAmount} />

      <Spacer height={10} />

      <ModalContentRow label={strings.listOrdersSheetTotalReturned} value={totalReturned} />

      <Spacer height={35} />

      <ModalContentRow label={strings.listOrdersSheetCancellationFee} value={fee} />

      <Spacer height={10} />

      <SwapInfoLink />

      <Spacer fill />

      <ModalContentButtons onConfirm={handleConfirm} onBack={onBack} />

      <Spacer height={30} />
    </View>
  )
}

const ModalContentHeader = ({
  assetFromIcon,
  assetFromLabel,
  assetToIcon,
  assetToLabel,
}: {
  assetFromIcon: React.ReactNode
  assetFromLabel: string
  assetToIcon: React.ReactNode
  assetToLabel: string
}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  return (
    <>
      <Text style={styles.contentTitle}>{strings.listOrdersSheetContentTitle}</Text>

      <Spacer height={10} />

      <View style={styles.modalContentTitle}>
        <View style={styles.modalContentTitle}>
          {assetFromIcon}

          <Spacer width={2} />

          <Text style={styles.modalContentTitleText}>{assetFromLabel}</Text>
        </View>

        <Spacer width={5} />

        <Text style={styles.modalContentTitleText}>/</Text>

        <Spacer width={5} />

        <View style={styles.modalContentTitle}>
          {assetToIcon}

          <Spacer width={2} />

          <Text style={styles.modalContentTitleText}>{assetToLabel}</Text>
        </View>
      </View>
    </>
  )
}

const ModalContentRow = ({label, value}: {label: string; value: string}) => {
  const {styles} = useStyles()
  return (
    <View style={styles.contentRow}>
      <Text style={styles.contentLabel}>{label}</Text>

      <Text style={styles.contentValue}>{value}</Text>
    </View>
  )
}

const ModalContentButtons = ({onBack, onConfirm}: {onBack: () => void; onConfirm: () => void}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  return (
    <View style={styles.buttons}>
      <Button
        title={strings.listOrdersSheetBack}
        style={{backgroundColor: 'transparent'}}
        onPress={onBack}
        block
        withoutBackground
        outlineShelley
        shelleyTheme
      />

      <Spacer width={20} />

      <Button title={strings.listOrdersSheetConfirm} onPress={onConfirm} warningTheme block />
    </View>
  )
}

const ListEmptyComponent = ({openOrders}: {openOrders: Array<MappedOpenOrder>}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if (isSearching && assetSearchTerm.length > 0 && openOrders.length === 0) return <EmptySearchResult />

  return <NoOrdersYet />
}

const NoOrdersYet = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  return (
    <View style={styles.notOrdersYetContainer}>
      <Spacer height={80} />

      <EmptyOpenOrdersIllustration style={styles.illustration} />

      <Space height="lg" />

      <Text style={styles.contentText}>{strings.emptyOpenOrders}</Text>

      <Spacer height={5} />

      <Text style={styles.contentSubText}>{strings.emptyOpenOrdersSub}</Text>
    </View>
  )
}

const useShowCollateralNotFoundAlert = (wallet: YoroiWallet) => {
  const strings = useStrings()
  const {navigateToCollateralSettings} = useWalletNavigation()
  const swapNavigateTo = useNavigateTo()

  return () => {
    const collateral = wallet.getCollateralInfo()
    const isCollateralUtxoPending = !collateral.isConfirmed && collateral.collateralId.length > 0

    if (isCollateralUtxoPending) {
      Alert.alert(strings.collateralTxPendingTitle, strings.collateralTxPending)
      return
    }

    Alert.alert(
      strings.collateralNotFound,
      strings.noActiveCollateral,
      [
        {
          text: strings.assignCollateral,
          onPress: () => {
            navigateToCollateralSettings({
              backButton: {onPress: () => swapNavigateTo.swapOpenOrders(), content: strings.backToSwapOrders},
            })
          },
        },
      ],
      {cancelable: true, onDismiss: () => true},
    )
  }
}

const EmptySearchResult = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {search: assetSearchTerm} = useSearch()

  return (
    <View style={styles.notOrdersYetContainer}>
      <Spacer height={80} />

      <EmptyOpenOrdersIllustration style={styles.illustration} />

      <Space height="lg" />

      <Text style={styles.contentText}>{`${strings.emptySearchOpenOrders} "${assetSearchTerm}"`}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    modalRoot: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    container: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    content: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    list: {
      ...atoms.px_lg,
    },
    contentRow: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    contentTitle: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
    },
    modalContentTitleText: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
      ...atoms.text_center,
    },
    contentLabel: {
      color: color.gray_600,
      ...atoms.body_1_lg_regular,
    },
    headerLabel: {
      color: color.gray_max,
      ...atoms.body_2_md_medium,
    },
    contentValue: {
      color: color.gray_max,
      ...atoms.body_1_lg_regular,
    },
    modalContentTitle: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    buttons: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    txLink: {
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    txLinkText: {
      color: color.text_primary_medium,
      ...atoms.link_1_lg,
    },

    label: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    counter: {
      ...atoms.py_lg,
    },
    illustration: {
      ...atoms.flex_1,
      alignSelf: 'center',
      width: 280,
      height: 224,
    },
    notOrdersYetContainer: {
      ...atoms.flex_1,
      ...atoms.text_center,
    },
    contentText: {
      ...atoms.flex_1,
      ...atoms.text_center,
      color: color.gray_max,
      ...atoms.heading_3_medium,
    },
    contentSubText: {
      ...atoms.flex_1,
      ...atoms.text_center,
      color: color.text_gray_low,
      ...atoms.body_1_lg_regular,
    },
    loading: {
      ...atoms.align_center,
      ...atoms.justify_center,
    },
  })

  return {styles} as const
}
