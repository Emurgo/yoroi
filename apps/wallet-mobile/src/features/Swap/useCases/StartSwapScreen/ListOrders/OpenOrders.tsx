import {PrivateKey} from '@emurgo/csl-mobile-bridge'
import {useSwap, useSwapOrdersByStatusOpen} from '@yoroi/swap'
import {BalanceQuantity} from '@yoroi/types/src/balance/token'
import {Buffer} from 'buffer'
import _ from 'lodash'
import React, {useCallback, useEffect, useState} from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useMutation} from 'react-query'

import {
  BottomSheetModal,
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
import {useSearch} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {HARD_DERIVATION_START} from '../../../../../yoroi-wallets/cardano/constants/common'
import {WrongPassword} from '../../../../../yoroi-wallets/cardano/errors'
import {useTokenInfos, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'
import {Counter} from '../../../common/Counter/Counter'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {mapOrders} from './mapOrders'

export const OpenOrders = () => {
  const [bottomSheetState, setBottomSheetState] = React.useState<BottomSheetState>({
    openId: null,
    title: '',
    content: '',
  })
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const strings = useStrings()
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const {order: swapApiOrder} = useSwap()

  const [orderId, setOrderId] = useState<string | null>(null)

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

  const handlePasswordConfirm = async (password: string) => {
    const order = normalizedOrders.find((o) => o.id === orderId)
    if (!order || order.owner === undefined || order.utxo === undefined) return
    const tx = await createCancellationTxAnsSign(order.id, password)
    if (!tx) return
    await wallet.submitTransaction(tx.txBase64)
    closeBottomSheet()
  }

  const onOrderCancelConfirm = (id: string) => {
    setOrderId(id)
    closeBottomSheet()

    setBottomSheetState({
      openId: id,
      title: strings.signTransaction,
      content: <PasswordModal onConfirm={handlePasswordConfirm} />,
    })
  }

  async function createCancellationTxAnsSign(
    orderId: string,
    password: string,
  ): Promise<{txBase64: string} | undefined> {
    const order = normalizedOrders.find((o) => o.id === orderId)
    if (!order || order.owner === undefined || order.utxo === undefined) return

    const orderUtxo = order.utxo

    const collateralUtxo =
      '82825820caec92c836b10281c35a3a9b13f732686cf8ddccb4c75c9aef42a1324da2197501825839017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea9046931a01f2b015'

    const addressBech32 = order.owner

    const address = await CardanoMobile.Address.fromBech32(addressBech32)
    const bytes = await address.toBytes()
    const addressHex = new Buffer(bytes).toString('hex')
    const cbor = await swapApiOrder.cancel({utxos: {collateral: collateralUtxo, order: orderUtxo}, address: addressHex})
    const rootKey = await wallet.encryptedStorage.rootKey.read(password)
    const masterKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(rootKey, 'hex'))
    const accountPrivateKey = await masterKey
      .derive(1852 + HARD_DERIVATION_START)
      .then((key) => key.derive(1815 + HARD_DERIVATION_START))
      .then((key) => key.derive(0 + HARD_DERIVATION_START))
      .then((key) => key.derive(0))
      .then((key) => key.derive(0))

    const rawKey = await accountPrivateKey.toRawKey()
    const bech32 = await rawKey.toBech32()

    const pkey = await PrivateKey.from_bech32(bech32)
    if (!pkey) return
    const response = await wallet.signRawTx(cbor, pkey)
    if (!response) return
    const hexBase64 = new Buffer(response).toString('base64')
    return {txBase64: hexBase64}
  }

  const openBottomSheet = (id: string) => {
    const order = normalizedOrders.find((o) => o.id === id)
    if (!order || order.owner === undefined || order.utxo === undefined) return
    const {assetFromLabel, assetToLabel} = order
    const totalReturned = `${order.fromTokenAmount} ${order.fromTokenInfo?.ticker}`
    const orderUtxo = order.utxo

    const collateralUtxo =
      '82825820caec92c836b10281c35a3a9b13f732686cf8ddccb4c75c9aef42a1324da2197501825839017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea9046931a01f2b015'

    const addressBech32 = order.owner

    setBottomSheetState({
      openId: id,
      title: strings.listOrdersSheetTitle,
      content: (
        <ModalContent
          assetFromIcon={<TokenIcon wallet={wallet} tokenId={order.fromTokenInfo?.id ?? ''} variant="swap" />}
          assetToIcon={<TokenIcon wallet={wallet} tokenId={order.toTokenInfo?.id ?? ''} variant="swap" />}
          onConfirm={() => onOrderCancelConfirm(id)}
          onBack={closeBottomSheet}
          assetFromLabel={assetFromLabel}
          assetToLabel={assetToLabel}
          assetAmount={`${order.tokenAmount} ${order.assetToLabel}`}
          assetPrice={`${order.tokenPrice} ${order.assetFromLabel}`}
          totalReturned={totalReturned}
          orderUtxo={orderUtxo}
          collateralUtxo={collateralUtxo}
          bech32Address={addressBech32}
        />
      ),
    })
  }
  const closeBottomSheet = () => setBottomSheetState({openId: null, title: '', content: ''})

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
                  <Footer onPress={() => openBottomSheet(order.id)}>
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

        <BottomSheetModal
          isOpen={bottomSheetState.openId !== null}
          title={bottomSheetState.title}
          onClose={closeBottomSheet}
          snapPoints={['1%', '51%']}
        >
          <View style={{flex: 1}}>{bottomSheetState.content}</View>
        </BottomSheetModal>
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

  const {isLoading, mutate, error} = useMutation({mutationFn: () => onConfirm(password)})

  return (
    <View style={{flex: 1}}>
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

      <Button testID="swapButton" disabled={isLoading} onPress={() => mutate()} shelleyTheme title={strings.sign} />
    </View>
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

  const {order} = useSwap()
  const wallet = useSelectedWallet()

  const [fee, setFee] = useState<string | null>(null)

  const getFee = useCallback(async () => {
    const address = await CardanoMobile.Address.fromBech32(bech32Address)
    const bytes = await address.toBytes()
    const addressHex = new Buffer(bytes).toString('hex')
    const cbor = await order.cancel({utxos: {collateral: collateralUtxo, order: orderUtxo}, address: addressHex})
    const tx = await CardanoMobile.Transaction.fromBytes(Buffer.from(cbor, 'hex'))
    const feeNumber = await tx.body().then((b) => b.fee())
    return Quantities.denominated(
      (await feeNumber.toStr()) as BalanceQuantity,
      wallet.primaryToken.metadata.numberOfDecimals,
    )
  }, [bech32Address, collateralUtxo, orderUtxo, wallet, order])

  const handleConfirm = () => {
    onConfirm()
  }

  useEffect(() => {
    getFee().then((fee) => {
      setFee(fee)
    })
  }, [getFee, setFee])

  if (fee === null) {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator animating size="large" color="black" style={{padding: 20}} />
      </View>
    )
  }

  return (
    <View>
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

      <ModalContentLink />

      <Spacer height={10} />

      <ModalContentButtons onConfirm={handleConfirm} onBack={onBack} />
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
})
