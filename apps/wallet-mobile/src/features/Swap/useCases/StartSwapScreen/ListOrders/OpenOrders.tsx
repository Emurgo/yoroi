import {useFocusEffect} from '@react-navigation/native'
import {isString} from '@yoroi/common'
import {useSwap, useSwapOrdersByStatusOpen} from '@yoroi/swap'
import {Buffer} from 'buffer'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'

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
import {LoadingOverlay} from '../../../../../components/LoadingOverlay'
import {useLanguage} from '../../../../../i18n'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../../navigation'
import {useSearch} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {
  convertBech32ToHex,
  getMuesliSwapTransactionAndSigners,
} from '../../../../../yoroi-wallets/cardano/common/signatureUtils'
import {createRawTxSigningKey, generateCIP30UtxoCbor} from '../../../../../yoroi-wallets/cardano/utils'
import {useTokenInfos, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'
import {ConfirmRawTx} from '../../../common/ConfirmRawTx/ConfirmRawTx'
import {Counter} from '../../../common/Counter/Counter'
import {LiquidityPool} from '../../../common/LiquidityPool/LiquidityPool'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {SwapInfoLink} from '../../../common/SwapInfoLink/SwapInfoLink'
import {getCancellationOrderFee} from './helpers'
import {mapOpenOrders, MappedOpenOrder} from './mapOrders'

export const OpenOrders = () => {
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const strings = useStrings()
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const {order: swapApiOrder} = useSwap()
  const {navigateToCollateralSettings, navigateToTxHistory} = useWalletNavigation()
  const [isLoading, setIsLoading] = React.useState(false)

  const orders = useSwapOrdersByStatusOpen()
  const {numberLocale} = useLanguage()
  const tokenIds = React.useMemo(() => _.uniq(orders?.flatMap((o) => [o.from.tokenId, o.to.tokenId])), [orders])
  const transactionsInfos = useTransactionInfos(wallet)
  const tokenInfos = useTokenInfos({wallet, tokenIds})
  const normalizedOrders = React.useMemo(
    () => mapOpenOrders(orders, tokenInfos, numberLocale, Object.values(transactionsInfos)),
    [orders, tokenInfos, numberLocale, transactionsInfos],
  )

  const {closeModal, openModal} = useModal()

  const {search} = useSearch()

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

  useFocusEffect(
    React.useCallback(() => {
      track.swapConfirmedPageViewed({swap_tab: 'Open Orders'})
    }, [track]),
  )

  const trackCancellationSubmitted = (order: MappedOpenOrder) => {
    track.swapCancelationSubmitted({
      from_amount: Number(order.from.quantity) ?? 0,
      to_amount: Number(order.to.quantity) ?? 0,
      from_asset: [
        {
          asset_name: order.fromTokenInfo?.name ?? '',
          asset_ticker: order.fromTokenInfo?.ticker ?? '',
          policy_id: order.fromTokenInfo?.group ?? '',
        },
      ],
      to_asset: [
        {
          asset_name: order.toTokenInfo?.name ?? '',
          asset_ticker: order.toTokenInfo?.ticker ?? '',
          policy_id: order.toTokenInfo?.group ?? '',
        },
      ],
      pool_source: order.provider ?? '',
    })
  }

  const onRawTxConfirm = async (rootKey: string, order: MappedOpenOrder) => {
    const tx = await createCancellationTxAndSign(order.id, rootKey)
    if (!tx) return
    await wallet.submitTransaction(tx.txBase64)
    trackCancellationSubmitted(order)
    closeModal()
    navigateToTxHistory()
  }

  const onRawTxHwConfirm = () => {
    closeModal()
    navigateToTxHistory()
  }

  const showCollateralNotFoundAlert = () => {
    Alert.alert(
      strings.collateralNotFound,
      strings.noActiveCollateral,
      [{text: strings.assignCollateral, onPress: navigateToCollateralSettings}],
      {cancelable: true, onDismiss: () => true},
    )
  }

  const hasCollateralUtxo = () => {
    return !!wallet.getCollateralInfo().utxo
  }

  const onOrderCancelConfirm = (order: MappedOpenOrder) => {
    if (!isString(order.utxo) || !isString(order.owner)) return

    if (!hasCollateralUtxo()) {
      showCollateralNotFoundAlert()
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
        onHWConfirm={() => onRawTxHwConfirm()}
      />,
      400,
    )
  }

  const getCollateralUtxo = async () => {
    const collateralInfo = wallet.getCollateralInfo()
    const utxo = collateralInfo.utxo

    if (!utxo) {
      throw new Error('Collateral utxo not found')
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
    const collateralUtxo = await getCollateralUtxo()
    const addressHex = await convertBech32ToHex(bech32Address)
    const originalCbor = await swapApiOrder.cancel({
      utxos: {collateral: collateralUtxo, order: utxo},
      address: addressHex,
    })
    const {cbor, signers} = await getMuesliSwapTransactionAndSigners(originalCbor, wallet)

    const tx = await CardanoMobile.Transaction.fromHex(cbor)

    // include the fee utxo in the inputs
    // build the script witness
    // add datum and the redeemer

    const newCbor = Buffer.from(await tx.toBytes()).toString('hex')

    const keys = await Promise.all(signers.map(async (signer) => createRawTxSigningKey(rootKey, signer)))
    const response = await wallet.signRawTx(newCbor, keys)
    if (!response) return
    const hexBase64 = Buffer.from(response).toString('base64')
    return {txBase64: hexBase64}
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
    if (!hasCollateralUtxo()) {
      showCollateralNotFoundAlert()
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
    const totalReturned = `${fromTokenAmount} ${fromTokenInfo?.ticker}`
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
          assetPrice={`${tokenPrice} ${assetFromLabel}`}
          totalReturned={totalReturned}
          fee={fee}
        />,
        460,
      )
    } catch (error) {
      setIsLoading(false)
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
        <ScrollView style={styles.content}>
          {filteredOrders.map((order) => {
            const fromIcon = <TokenIcon wallet={wallet} tokenId={order.fromTokenInfo?.id ?? ''} variant="swap" />
            const toIcon = <TokenIcon wallet={wallet} tokenId={order.toTokenInfo?.id ?? ''} variant="swap" />
            const liquidityPoolIcon =
              order.provider !== undefined ? <PoolIcon size={32} providerId={order.provider} /> : null
            const expanded = order.id === hiddenInfoOpenId
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
                withBoxShadow
              >
                <MainInfo
                  tokenAmount={`${order.tokenAmount} ${order.assetToLabel}`}
                  tokenPrice={`${order.tokenPrice} ${order.assetFromLabel}`}
                  date={intl.formatDate(new Date(order.date), {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                    hour12: false,
                  })}
                />
              </ExpandableInfoCard>
            )
          })}
        </ScrollView>
      </View>

      <Counter
        style={styles.counter}
        openingText={strings.youHave}
        counter={orders?.length ?? 0}
        closingText={strings.listOpenOrders}
      />

      <LoadingOverlay loading={isLoading} />
    </>
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
  return (
    <HeaderWrapper expanded={expanded} onPress={onPress}>
      <View style={styles.label}>
        {assetFromIcon}

        <Spacer width={4} />

        <Text>{assetFromLabel}</Text>

        <Text>/</Text>

        <Spacer width={4} />

        {assetToIcon}

        <Spacer width={4} />

        <Text>{assetToLabel}</Text>
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
      {orderInfo.map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === orderInfo.length - 1} />
      ))}
    </View>
  )
}

const TxLink = ({txLink, txId}: {txLink: string; txId: string}) => {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(txLink)} style={styles.txLink}>
      <Text style={styles.txLinkText}>{txId}</Text>
    </TouchableOpacity>
  )
}

export const OpenOrdersSkeleton = () => (
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

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <>
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
    </>
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

        <Text>/</Text>

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
  return (
    <View style={styles.contentRow}>
      <Text style={styles.contentLabel}>{label}</Text>

      <Text style={styles.contentValue}>{value}</Text>
    </View>
  )
}

const ModalContentButtons = ({onBack, onConfirm}: {onBack: () => void; onConfirm: () => void}) => {
  const strings = useStrings()
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

      <Button title={strings.listOrdersSheetConfirm} onPress={onConfirm} style={{backgroundColor: '#FF1351'}} block />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentTitle: {
    color: '#242838',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  modalContentTitleText: {
    color: '#242838',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
  },
  contentLabel: {
    color: '#6B7384',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  contentValue: {
    color: '#000',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  modalContentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  txLinkText: {
    color: '#4B6DDE',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    textDecorationLine: 'underline',
  },

  label: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counter: {
    paddingVertical: 16,
  },
})
