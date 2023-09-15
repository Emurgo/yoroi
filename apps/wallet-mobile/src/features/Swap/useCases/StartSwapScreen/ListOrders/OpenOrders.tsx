import {useOrderByStatusOpen, useSwap} from '@yoroi/swap'
import {Buffer} from 'buffer'
import _ from 'lodash'
import React, {useEffect, useState} from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'

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
  TokenIcon,
} from '../../../../../components'
import {useLanguage} from '../../../../../i18n'
import {formatTokenWithText} from '../../../../../legacy/format'
import {useWalletNavigation} from '../../../../../navigation'
import {useSearch} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfos, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {YoroiEntry, YoroiUnsignedTx} from '../../../../../yoroi-wallets/types'
import {Amounts} from '../../../../../yoroi-wallets/utils'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'
import {Counter} from '../../../common/Counter/Counter'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {ConfirmTx} from '../../ConfirmTxScreen/ConfirmTx'
import {mapOrders} from './mapOrders'

export const OpenOrders = () => {
  const [bottomSheetState, setBottomSheetState] = React.useState<BottomSheetState>({
    openId: null,
    title: '',
    content: '',
  })
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const strings = useStrings()
  const {numberLocale} = useLanguage()
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const transactionsInfos = useTransactionInfos(wallet)
  const {search} = useSearch()
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false)
  const [cancellationUnsignedTx, setCancellationUnsignedTx] = useState<YoroiUnsignedTx | null>(null)

  const {openOrders} = useOrderByStatusOpen({
    queryKey: [wallet.id, 'open-orders'],
  })

  const {resetToTxHistory} = useWalletNavigation()
  const datum = '' // TODO: Use real values

  const tokenIds = _.uniq(openOrders?.flatMap((o) => [o.from.tokenId, o.to.tokenId]))

  const tokenInfos = useTokenInfos({wallet, tokenIds: tokenIds})

  const normalizedOrders = mapOrders(openOrders, tokenInfos, numberLocale, Object.values(transactionsInfos))

  const searchLower = search.toLocaleLowerCase()

  const filteredOrders = normalizedOrders.filter((order) => {
    return (
      order.assetFromLabel.toLocaleLowerCase().includes(searchLower) ||
      order.assetToLabel.toLocaleLowerCase().includes(searchLower)
    )
  })

  const onOrderCancelConfirm = (id: string, unsignedTx: YoroiUnsignedTx) => {
    const order = normalizedOrders.find((o) => o.id === id)
    if (!order) return
    closeBottomSheet()
    setCancellationUnsignedTx(unsignedTx)
    setShowCancelOrderModal(true)
  }

  const openBottomSheet = (id: string) => {
    const order = normalizedOrders.find((o) => o.id === id)
    if (!order || order.owner === undefined) return
    const {assetFromLabel, assetToLabel} = order
    const totalReturned = `${order.fromTokenAmount} ${order.fromTokenInfo?.ticker}`
    const orderUtxo = order.utxo
    const collateralUtxo =
      '8282582084bfdb864f8d0191b1a39289195d5a0d1b6eafe8eafd6d855ceea8a5c866ad6002825839017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea9046931a02cb6519' // TODO: Use real values

    const addressBech32 = order.owner

    setBottomSheetState({
      openId: id,
      title: strings.listOrdersSheetTitle,
      content: (
        <ModalContent
          assetFromIcon={<TokenIcon wallet={wallet} tokenId={order.fromTokenInfo?.id ?? ''} variant="swap" />}
          assetToIcon={<TokenIcon wallet={wallet} tokenId={order.toTokenInfo?.id ?? ''} variant="swap" />}
          onConfirm={(unsignedTx) => onOrderCancelConfirm(id, unsignedTx)}
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
        {cancellationUnsignedTx && (
          <BottomSheetModal
            isOpen={showCancelOrderModal}
            title={wallet.isHW ? strings.chooseConnectionMethod : strings.signTransaction}
            onClose={() => {
              setShowCancelOrderModal(false)
            }}
            contentContainerStyle={{justifyContent: 'space-between'}}
          >
            <ConfirmTx
              datum={{data: datum}}
              wallet={wallet}
              unsignedTx={cancellationUnsignedTx}
              onSuccess={() => resetToTxHistory()}
              onCancel={() => setShowCancelOrderModal(false)}
            />
          </BottomSheetModal>
        )}

        <ScrollView style={styles.flex}>
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
          snapPoints={['10%', '57%']}
        >
          {bottomSheetState.content}
        </BottomSheetModal>

        <BottomSheetModal
          isOpen={bottomSheetState.openId !== null}
          title={bottomSheetState.title}
          onClose={closeBottomSheet}
        >
          <Text style={styles.text}>{bottomSheetState.content}</Text>
        </BottomSheetModal>
      </View>

      <Counter counter={openOrders?.length ?? 0} customText={strings.listOpenOrders} />
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
    <View style={styles.flex}>
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
  onConfirm: (unsignedTx: YoroiUnsignedTx) => void
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

  const {order, unsignedTxChanged} = useSwap()
  const wallet = useSelectedWallet()
  const [unsignedTx, setUnsignedTx] = useState<YoroiUnsignedTx | null>(null)
  useEffect(() => {
    CardanoMobile.Address.fromBech32(bech32Address).then(async (address) => {
      const bytes = await address.toBytes()
      const addressHex = new Buffer(bytes).toString('hex')
      const cbor = await order.cancel({utxos: {collateral: collateralUtxo, order: orderUtxo}, address: addressHex})
      const tx = await CardanoMobile.Transaction.fromBytes(Buffer.from(cbor, 'hex'))
      console.log('tx json', await tx.wasm.to_json())

      const fakeEntry: YoroiEntry = {
        // TODO: Use real values
        address: bech32Address,
        amounts: {
          '': '1',
        },
      }
      const unsignedTx = await wallet.createUnsignedTx(fakeEntry)
      unsignedTxChanged(unsignedTx)
      setUnsignedTx(unsignedTx)
    })
  }, [bech32Address, orderUtxo, collateralUtxo, order, wallet])

  const feeAmount = unsignedTx
    ? formatTokenWithText(
        Amounts.getAmount(unsignedTx.fee, wallet.primaryToken.identifier).quantity,
        wallet.primaryToken,
      )
    : null

  if (feeAmount === null) {
    // TODO: Use mutation to handle loading / error states
    // TODO: Verify loading state designs
    return (
      <View>
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

      <ModalContentRow label={strings.listOrdersSheetCancellationFee} value={feeAmount} />

      <ModalContentLink />

      <Spacer height={10} />

      <ModalContentButtons onConfirm={() => (unsignedTx ? onConfirm(unsignedTx) : null)} onBack={onBack} />
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
  flex: {
    flex: 1,
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
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
