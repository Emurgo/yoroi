import {useFocusEffect} from '@react-navigation/native'
import {useSwap, useSwapOrdersByStatusOpen} from '@yoroi/swap'
import {Buffer} from 'buffer'
import _ from 'lodash'
import React, {Suspense, useState} from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'

import {
  BottomSheet,
  BottomSheetRef,
  BottomSheetState,
  Button,
  ExpandableInfoCard,
  ExpandableInfoCardSkeleton,
  Footer,
  HeaderWrapper,
  HiddenInfoWrapper,
  MainInfoWrapper,
  Spacer,
  Text,
  TextInput,
  TokenIcon,
} from '../../../../../components'
import {useLanguage} from '../../../../../i18n'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../../navigation'
import {useSearch} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {WrongPassword} from '../../../../../yoroi-wallets/cardano/errors'
import {generateCIP30UtxoCbor, generateMuesliSwapSigningKey} from '../../../../../yoroi-wallets/cardano/utils'
import {useTokenInfos, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {Counter} from '../../../common/Counter/Counter'
import {useNavigateTo} from '../../../common/navigation'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {convertBech32ToHex, useCancellationOrderFee} from './helpers'
import {mapOrders, MappedOrder} from './mapOrders'

export const OpenOrders = () => {
  const [bottomSheetState, setBottomSheetState] = React.useState<BottomSheetState & {height: number}>({
    openId: null,
    title: '',
    content: '',
    height: 0,
  })
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const strings = useStrings()
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const {order: swapApiOrder} = useSwap()
  const {navigateToCollateralSettings} = useWalletNavigation()

  const bottomSheetRef = React.useRef<null | BottomSheetRef>(null)
  const orders = useSwapOrdersByStatusOpen()
  const {numberLocale} = useLanguage()
  const tokenIds = React.useMemo(() => _.uniq(orders?.flatMap((o) => [o.from.tokenId, o.to.tokenId])), [orders])
  const transactionsInfos = useTransactionInfos(wallet)
  const tokenInfos = useTokenInfos({wallet, tokenIds})
  const normalizedOrders = React.useMemo(
    () => mapOrders(orders, tokenInfos, numberLocale, Object.values(transactionsInfos)),
    [orders, tokenInfos, numberLocale, transactionsInfos],
  )

  const {search} = useSearch()
  const swapNavigation = useNavigateTo()

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

  const trackCancellationSubmitted = (order: MappedOrder) => {
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

  const handlePasswordConfirm = async (password: string, orderId: string) => {
    const order = normalizedOrders.find((o) => o.id === orderId)
    if (!order || order.owner === undefined || order.utxo === undefined) return
    const tx = await createCancellationTxAndSign(order.id, password)
    if (!tx) return
    await wallet.submitTransaction(tx.txBase64)
    trackCancellationSubmitted(order)
    closeBottomSheet()
    swapNavigation.submittedTx()
  }

  const onOrderCancelConfirm = (id: string) => {
    setBottomSheetState({
      openId: id,
      title: strings.signTransaction,
      content: wallet.isHW ? null : <PasswordModal onConfirm={(password) => handlePasswordConfirm(password, id)} />,
      height: 350,
    })
  }

  const getCollateralUtxo = async () => {
    const collateralInfo = wallet.getCollateralInfo()
    const utxo = collateralInfo.utxo

    if (!utxo) {
      Alert.alert(
        strings.collateralNotFound,
        strings.noActiveCollateral,
        [{text: strings.assignCollateral, onPress: navigateToCollateralSettings}],
        {cancelable: true, onDismiss: () => true},
      )
      throw new Error('Collateral utxo not found')
    }

    return generateCIP30UtxoCbor(utxo)
  }

  const createCancellationTxAndSign = async (
    orderId: string,
    password: string,
  ): Promise<{txBase64: string} | undefined> => {
    const order = normalizedOrders.find((o) => o.id === orderId)
    if (!order || order.owner === undefined || order.utxo === undefined) return
    const {utxo, owner: bech32Address} = order
    const collateralUtxo = await getCollateralUtxo()
    const addressHex = await convertBech32ToHex(bech32Address)
    const cbor = await swapApiOrder.cancel({utxos: {collateral: collateralUtxo, order: utxo}, address: addressHex})
    const rootKey = await wallet.encryptedStorage.rootKey.read(password)

    const response = await wallet.signRawTx(cbor, await generateMuesliSwapSigningKey(rootKey))
    if (!response) return
    const hexBase64 = new Buffer(response).toString('base64')
    return {txBase64: hexBase64}
  }

  const openBottomSheet = async (order: MappedOrder) => {
    if (order.owner === undefined || order.utxo === undefined) return
    const {
      utxo,
      owner: bech32Address,
      fromTokenAmount,
      fromTokenInfo,
      id,
      toTokenInfo,
      assetFromLabel,
      assetToLabel,
      tokenPrice,
      tokenAmount,
    } = order
    const totalReturned = `${fromTokenAmount} ${fromTokenInfo?.ticker}`
    const collateralUtxo = await getCollateralUtxo()

    setBottomSheetState({
      height: 400,
      openId: id,
      title: strings.listOrdersSheetTitle,
      content: (
        <Suspense fallback={<ModalLoadingState />}>
          <ModalContent
            assetFromIcon={<TokenIcon wallet={wallet} tokenId={fromTokenInfo?.id ?? ''} variant="swap" />}
            assetToIcon={<TokenIcon wallet={wallet} tokenId={toTokenInfo?.id ?? ''} variant="swap" />}
            onConfirm={() => onOrderCancelConfirm(id)}
            onBack={closeBottomSheet}
            assetFromLabel={assetFromLabel}
            assetToLabel={assetToLabel}
            assetAmount={`${tokenAmount} ${assetToLabel}`}
            assetPrice={`${tokenPrice} ${assetFromLabel}`}
            totalReturned={totalReturned}
            orderUtxo={utxo}
            collateralUtxo={collateralUtxo}
            bech32Address={bech32Address}
          />
        </Suspense>
      ),
    })
    bottomSheetRef.current?.openBottomSheet()
  }
  const closeBottomSheet = () => {
    setBottomSheetState({openId: null, title: '', content: '', height: 0})
    bottomSheetRef.current?.closeBottomSheet()
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
            const extended = order.id === hiddenInfoOpenId
            return (
              <ExpandableInfoCard
                key={order.id}
                adornment={
                  <HiddenInfo
                    txId={order.txId}
                    total={`${order.total} ${order.assetFromLabel}`}
                    txLink={order.txLink}
                    date={intl.formatDate(new Date(order.date), {dateStyle: 'short', timeStyle: 'short'})}
                    liquidityPoolIcon={liquidityPoolIcon}
                    liquidityPoolName={order.provider ?? ''}
                    poolUrl={order.poolUrl ?? ''}
                  />
                }
                extended={extended}
                header={
                  <Header
                    onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== order.id ? order.id : null)}
                    assetFromLabel={order.assetFromLabel}
                    assetToLabel={order.assetToLabel}
                    assetFromIcon={fromIcon}
                    assetToIcon={toIcon}
                    extended={extended}
                  />
                }
                footer={
                  <Footer onPress={() => openBottomSheet(order)}>
                    {strings.listOrdersSheetButtonText.toLocaleUpperCase()}
                  </Footer>
                }
                withBoxShadow
              >
                <MainInfo
                  tokenAmount={`${order.tokenAmount} ${order.assetToLabel}`}
                  tokenPrice={`${order.tokenPrice} ${order.assetFromLabel}`}
                />
              </ExpandableInfoCard>
            )
          })}
        </ScrollView>

        <BottomSheet
          title={bottomSheetState.title}
          height={bottomSheetState.height}
          ref={bottomSheetRef}
          isExtendable={false}
        >
          <View style={styles.modalContent}>{bottomSheetState.content}</View>
        </BottomSheet>
      </View>

      <Counter style={styles.counter} counter={orders?.length ?? 0} customText={strings.listOpenOrders} />
    </>
  )
}

const Header = ({
  assetFromLabel,
  assetToLabel,
  assetFromIcon,
  assetToIcon,
  extended,
  onPress,
}: {
  assetFromLabel: string
  assetToLabel: string
  assetFromIcon: React.ReactNode
  assetToIcon: React.ReactNode
  extended: boolean
  onPress: () => void
}) => {
  return (
    <HeaderWrapper extended={extended} onPress={onPress}>
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
  date,
  txId,
  txLink,
}: {
  total: string
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  poolUrl: string
  date: string
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
          label: strings.listOrdersLiquidityPool,
          value: (
            <LiquidityPool
              liquidityPoolIcon={liquidityPoolIcon}
              liquidityPoolName={liquidityPoolName}
              poolUrl={poolUrl}
            />
          ),
        },
        {
          label: strings.listOrdersTimeCreated,
          value: date,
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

const PasswordModal = ({onConfirm}: {onConfirm: (password: string) => Promise<void>}) => {
  const [password, setPassword] = useState('')
  const strings = useStrings()

  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const onConfirmPress = async () => {
    setError(null)
    setLoading(true)
    try {
      await onConfirm(password)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e)
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

      <TextInput
        secureTextEntry
        enablesReturnKeyAutomatically
        placeholder={strings.spendingPassword}
        value={password}
        onChangeText={setPassword}
        autoComplete="off"
        label={strings.spendingPassword}
      />

      {error !== null ? (
        <View>
          <Text style={styles.errorMessage} numberOfLines={3}>
            {getErrorMessage(error, strings)}
          </Text>
        </View>
      ) : null}

      <Spacer fill />

      <Button testID="swapButton" disabled={loading} onPress={onConfirmPress} shelleyTheme title={strings.sign} />

      <Spacer height={10} />
    </>
  )
}

const getErrorMessage = (error: unknown, strings: Record<'wrongPasswordMessage' | 'error', string>) => {
  if (error instanceof WrongPassword) {
    return strings.wrongPasswordMessage
  }
  if (error instanceof Error) {
    return error.message
  }

  return strings.error
}

const MainInfo = ({tokenPrice, tokenAmount}: {tokenPrice: string; tokenAmount: string}) => {
  const strings = useStrings()
  return (
    <View>
      {[
        {label: strings.listOrdersSheetAssetPrice, value: tokenPrice},
        {label: strings.listOrdersSheetAssetAmount, value: tokenAmount},
      ].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === 1} />
      ))}
    </View>
  )
}

const ModalLoadingState = () => (
  <View style={styles.centered}>
    <ActivityIndicator animating size="large" color="black" style={styles.loadingActivityContainer} />
  </View>
)

const TxLink = ({txLink, txId}: {txLink: string; txId: string}) => {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(txLink)} style={styles.txLink}>
      <Text style={styles.txLinkText}>{txId}</Text>
    </TouchableOpacity>
  )
}

const LiquidityPool = ({
  liquidityPoolIcon,
  liquidityPoolName,
  poolUrl,
}: {
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  poolUrl: string
}) => {
  return (
    <View style={styles.liquidityPool}>
      {liquidityPoolIcon}

      <Spacer width={3} />

      <TouchableOpacity onPress={() => Linking.openURL(poolUrl)} style={styles.liquidityPoolLink}>
        <Text style={styles.liquidityPoolText}>{liquidityPoolName}</Text>
      </TouchableOpacity>
    </View>
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
  orderUtxo,
  collateralUtxo,
  bech32Address,
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
  orderUtxo: string
  collateralUtxo: string
  bech32Address: string
}) => {
  const strings = useStrings()

  const fee = useCancellationOrderFee({
    orderUtxo,
    collateralUtxo,
    bech32Address,
  })

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

      <Spacer height={10} />

      <ModalContentRow label={strings.listOrdersSheetCancellationFee} value={fee} />

      <Spacer height={10} />

      <ModalContentLink />

      <Spacer fill />

      <ModalContentButtons onConfirm={handleConfirm} onBack={onBack} />

      <Spacer height={10} />
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

          <Text>{assetFromLabel}</Text>
        </View>

        <Spacer width={5} />

        <Text>/</Text>

        <Spacer width={5} />

        <View style={styles.modalContentTitle}>
          {assetToIcon}

          <Spacer width={2} />

          <Text>{assetToLabel}</Text>
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

const ModalContentLink = () => {
  const strings = useStrings()
  return (
    // TODO: add real link
    <TouchableOpacity onPress={() => Linking.openURL('https://google.com')} style={styles.link}>
      <Text style={styles.linkText}>{strings.listOrdersSheetLink}</Text>
    </TouchableOpacity>
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
  loadingActivityContainer: {
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: 10,
  },
  modalText: {
    paddingHorizontal: 70,
    textAlign: 'center',
    paddingBottom: 8,
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
  errorMessage: {
    color: COLORS.ERROR_TEXT_COLOR,
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
  link: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: '#4B6DDE',
    fontFamily: 'Rubik-Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
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
  },
  liquidityPool: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liquidityPoolLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquidityPoolText: {
    color: '#4B6DDE',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },

  label: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counter: {
    paddingVertical: 16,
  },
  modalContent: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
})
