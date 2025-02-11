import {useNavigation} from '@react-navigation/core'
import {NavigationState, useFocusEffect} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {isString} from '@yoroi/common'
import {amountFormatter, infoExtractName} from '@yoroi/portfolio'
import {getPoolUrlByProvider, useSwap, useSwapOrdersByStatusOpen} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import _, {capitalize} from 'lodash'
import React, {useRef} from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Alert, Linking, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import {Button, ButtonType} from '../../../../../components/Button/Button'
import {Divider} from '../../../../../components/Divider/Divider'
import {
  ExpandableInfoCard,
  ExpandableInfoCardSkeleton,
  Footer,
  HeaderWrapper,
  HiddenInfoWrapper,
  MainInfoWrapper,
} from '../../../../../components/ExpandableInfoCard/ExpandableInfoCard'
import {useModal} from '../../../../../components/Modal/ModalContext'
import {Space} from '../../../../../components/Space/Space'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {useLanguage} from '../../../../../kernel/i18n'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../kernel/navigation'
import {isEmptyString} from '../../../../../kernel/utils'
import {SubmitTxInsufficientCollateralError} from '../../../../../yoroi-wallets/cardano/api/errors'
import {convertBech32ToHex} from '../../../../../yoroi-wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {generateCIP30UtxoCbor} from '../../../../../yoroi-wallets/cardano/utils'
import {useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {usePortfolioTokenInfos} from '../../../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {TokenInfoIcon} from '../../../../Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {useSearch} from '../../../../Search/SearchContext'
import {getCollateralAmountInLovelace} from '../../../../Settings/useCases/changeWalletSettings/ManageCollateral/helpers'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {Counter} from '../../../common/Counter/Counter'
import {EmptyOpenOrdersIllustration} from '../../../common/Illustrations/EmptyOpenOrdersIllustration'
import {LiquidityPool} from '../../../common/LiquidityPool/LiquidityPool'
import {useNavigateTo} from '../../../common/navigation'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {getCancellationOrderFee} from './helpers'
import {mapOpenOrders, MappedOpenOrder} from './mapOrders'

export const OpenOrders = () => {
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const strings = useStrings()
  const {styles} = useStyles()
  const intl = useIntl()
  const {wallet} = useSelectedWallet()
  const {order: swapApiOrder} = useSwap()
  const {navigateToTxReview} = useWalletNavigation()
  const [isLoading, setIsLoading] = React.useState(false)
  const navigateTo = useNavigateTo()

  const orders = useSwapOrdersByStatusOpen()
  const {numberLocale} = useLanguage()
  const tokenIds = React.useMemo(() => _.uniq(orders?.flatMap((o) => [o.from.tokenId, o.to.tokenId])), [orders])
  const transactionsInfos = useTransactionInfos({wallet})
  const explorers = wallet.networkManager.explorers
  const {tokenInfos} = usePortfolioTokenInfos({wallet, tokenIds}, {suspense: true})

  const normalizedOrders = React.useMemo(() => {
    if (!tokenInfos) return []
    return mapOpenOrders(orders, tokenInfos, numberLocale, Object.values(transactionsInfos), explorers.cardanoscan)
  }, [orders, tokenInfos, numberLocale, transactionsInfos, explorers.cardanoscan])
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
      from_amount: Number(order.from.quantity ?? 0),
      to_amount: Number(order.to.quantity ?? 0),
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

  const onSuccess = (order: MappedOpenOrder) => {
    try {
      trackCancellationSubmitted(order)
      navigateTo.submittedTx()
      closeModal()
    } catch (error) {
      if (error instanceof SubmitTxInsufficientCollateralError) {
        handleCollateralError()
        return
      }
      navigateTo.failedTx()
    }
  }

  const showCollateralNotFoundAlert = useShowCollateralNotFoundAlert(wallet)

  const hasCollateral = () => {
    const collateral = wallet.getCollateralInfo()
    return !!collateral.utxo && collateral.amount.quantity >= BigInt(getCollateralAmountInLovelace())
  }

  const generateSwapCancellationCbor = async (bech32Address: string, utxo: string) => {
    const collateralUtxo = await getCollateralUtxo()
    const addressHex = await convertBech32ToHex(bech32Address)
    const cbor = await swapApiOrder.cancel({
      utxos: {collateral: collateralUtxo, order: utxo},
      address: addressHex,
    })

    return cbor
  }

  const onOrderCancelConfirm = async (
    order: MappedOpenOrder,
    assetAmount: string,
    assetPrice: string,
    totalReturned: string,
    fee: string,
    liquidityPool: React.ReactNode,
  ) => {
    if (!isString(order.utxo) || !isString(order.owner)) return

    if (!hasCollateral()) {
      handleCollateralError()
      return
    }

    const cbor = await generateSwapCancellationCbor(order.owner, order.utxo)

    navigateToTxReview({
      cbor,
      onSuccess: () => onSuccess(order),
      details: {
        component: (
          <Details
            order={order}
            assetAmount={assetAmount}
            assetPrice={assetPrice}
            totalReturned={totalReturned}
            fee={fee}
            liquidityPool={liquidityPool}
          />
        ),
        title: strings.swapCancellationDetailsTitle,
      },
    })
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
      provider,
    } = order
    const collateralUtxo = await getCollateralUtxo()
    const assetAmount = `${tokenAmount} ${assetToLabel}`
    const assetPrice = `${tokenPrice} ${assetFromLabel}/${assetToLabel}`
    const totalReturned = `${fromTokenAmount} ${fromTokenInfo?.ticker ?? fromTokenInfo?.name}`

    const poolIcon = !isEmptyString(provider) ? <PoolIcon providerId={provider} size={18} /> : null
    const poolProviderFormatted = !isEmptyString(provider) ? capitalize(provider) : null
    const poolUrl = !isEmptyString(provider) ? getPoolUrlByProvider(provider) : null

    const liquidityPool =
      poolIcon && poolProviderFormatted != null && poolUrl != null ? (
        <LiquidityPool liquidityPoolIcon={poolIcon} liquidityPoolName={poolProviderFormatted} poolUrl={poolUrl} />
      ) : null

    try {
      const fee = `${await getFee(utxo, collateralUtxo, bech32Address)} ${wallet.portfolioPrimaryTokenInfo.ticker}`

      openModal({
        title: strings.listOrdersSheetTitle,
        content: (
          <ModalContent
            assetFromIcon={<TokenInfoIcon info={fromTokenInfo} size="sm" />}
            assetToIcon={<TokenInfoIcon info={toTokenInfo} size="sm" />}
            onConfirm={() => onOrderCancelConfirm(order, assetAmount, assetPrice, totalReturned, fee, liquidityPool)}
            onBack={closeModal}
            assetFromLabel={assetFromLabel}
            assetToLabel={assetToLabel}
            assetAmount={`${tokenAmount} ${assetToLabel}`}
            assetPrice={`${tokenPrice} ${assetFromLabel}/${assetToLabel}`}
            totalReturned={totalReturned}
            fee={fee}
            liquidityPool={liquidityPool}
          />
        ),
        height: 460,
      })
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
          renderItem={({item: order}) => {
            const fromIcon = <TokenInfoIcon info={order.fromTokenInfo} size="sm" />
            const toIcon = <TokenInfoIcon info={order.toTokenInfo} size="sm" />
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
  liquidityPool,
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
  liquidityPool: React.ReactNode
}) => {
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

      <ModalData
        assetPrice={assetPrice}
        assetAmount={assetAmount}
        totalReturned={totalReturned}
        fee={fee}
        liquidityPool={liquidityPool}
      />

      <Spacer fill />

      <ModalContentButtons onConfirm={handleConfirm} onBack={onBack} />

      <Spacer height={30} />
    </View>
  )
}

const ModalData = ({
  assetPrice,
  assetAmount,
  totalReturned,
  fee,
  liquidityPool,
}: {
  assetPrice: string
  assetAmount: string
  totalReturned: string
  fee: string
  liquidityPool: React.ReactNode
}) => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View>
      <View style={styles.contentRow}>
        <Text style={styles.contentLabel}>{strings.dex.toLocaleUpperCase()}</Text>

        {liquidityPool}
      </View>

      <Space height="sm" />

      <ModalContentRow label={strings.listOrdersSheetAssetPrice} value={assetPrice} />

      <Space height="sm" />

      <ModalContentRow label={strings.listOrdersSheetAssetAmount} value={assetAmount} />

      <Space height="sm" />

      <ModalContentRow label={strings.listOrdersSheetTotalReturned} value={totalReturned} />

      <Space height="sm" />

      <ModalContentRow label={strings.listOrdersSheetCancellationFee} value={fee} />
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
      <Button type={ButtonType.Secondary} title={strings.listOrdersSheetBack} onPress={onBack} />

      <Spacer width={20} />

      <Button type={ButtonType.Critical} title={strings.listOrdersSheetConfirm} onPress={onConfirm} />
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

const Details = ({
  order,
  assetAmount,
  assetPrice,
  totalReturned,
  fee,
  liquidityPool,
}: {
  order: MappedOpenOrder
  assetAmount: string
  assetPrice: string
  totalReturned: string
  fee: string
  liquidityPool: React.ReactNode
}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const isFromPrimary = order.fromTokenInfo?.nature === Portfolio.Token.Nature.Primary
  const fromDetail = isFromPrimary ? order.fromTokenInfo?.description : order.fromTokenInfo?.fingerprint
  const fromName = order.fromTokenInfo ? infoExtractName(order.fromTokenInfo) : ''
  const fromAmount = order.fromTokenInfo ? {quantity: order.from.quantity, info: order.fromTokenInfo} : null

  const isToPrimary = order.toTokenInfo?.nature === Portfolio.Token.Nature.Primary
  const toDetail = isToPrimary ? order.toTokenInfo?.description : order.toTokenInfo?.fingerprint
  const toName = order.toTokenInfo ? infoExtractName(order.toTokenInfo) : ''
  const toAmount = order.toTokenInfo ? {quantity: order.to.quantity, info: order.toTokenInfo} : null

  return (
    <View>
      <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

      <View style={styles.token}>
        <Left>
          <TokenInfoIcon info={order.fromTokenInfo} size="md" />
        </Left>

        <Middle>
          <View style={styles.row}>
            <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
              {fromName}
            </Text>
          </View>

          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
            {fromDetail}
          </Text>
        </Middle>

        <Right style={styles.end}>
          {fromAmount && (
            <Text style={styles.quantity}>{`${amountFormatter({dropTraillingZeros: true})(fromAmount)} ${
              order.fromTokenInfo?.ticker ?? ''
            }`}</Text>
          )}
        </Right>
      </View>

      <Space height="lg" />

      <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

      <View style={styles.token}>
        <Left>
          <TokenInfoIcon info={order.toTokenInfo} size="md" />
        </Left>

        <Middle>
          <View style={styles.row}>
            <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
              {toName}
            </Text>
          </View>

          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
            {toDetail}
          </Text>
        </Middle>

        <Right style={styles.end}>
          {toAmount && (
            <Text style={styles.quantity}>{`${amountFormatter({dropTraillingZeros: true})(toAmount)} ${
              order.toTokenInfo?.ticker ?? ''
            }`}</Text>
          )}
        </Right>
      </View>

      <Space height="lg" />

      <Divider />

      <Space height="lg" />

      <ModalData
        assetAmount={assetAmount}
        assetPrice={assetPrice}
        totalReturned={totalReturned}
        fee={fee}
        liquidityPool={liquidityPool}
      />
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={style} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1, justifyContent: 'center', paddingHorizontal: 8}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={style} {...props} />

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
    row: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    end: {
      ...atoms.align_end,
    },
    quantity: {
      color: color.gray_900,
      ...atoms.body_1_lg_regular,
    },
    name: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
    detail: {
      color: color.gray_600,
      maxWidth: 140,
      ...atoms.body_3_sm_regular,
    },
    token: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    amountItemLabel: {
      fontSize: 12,
      color: color.text_gray_medium,
      ...atoms.pb_sm,
    },
  })

  const colors = {
    icon: color.secondary_600,
  }

  return {styles, colors} as const
}
