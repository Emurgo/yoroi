import {getMinAdaReceiveAfterSlippage, getTotalFees, useSwap} from '@yoroi/swap'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {
  BottomSheetModal,
  ExpandableInfoCard,
  HeaderWrapper,
  HiddenInfoWrapper,
  MainInfoWrapper,
  Spacer,
} from '../../../../../../components'
import {useLanguage} from '../../../../../../i18n'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {asQuantity, Quantities} from '../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../common/navigation'
import {PoolIcon} from '../../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

export const ShowPoolActions = () => {
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()
  const {createOrder} = useSwap()
  const strings = useStrings()
  const {isBuyTouched, isSellTouched, isPoolTouched} = useSwapTouched()
  const {selectedPool, amounts} = createOrder
  const wallet = useSelectedWallet()
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const tokenName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  if (!isBuyTouched || !isSellTouched || selectedPool === undefined) {
    return <></>
  }
  const totalAmount = Quantities.format(amounts.buy.quantity, buyTokenInfo.decimals ?? 0)
  const calculatedFee = (Number(selectedPool?.fee) / 100) * Number(createOrder.amounts.sell.quantity)
  const providerFee = Quantities.format(asQuantity(calculatedFee ?? 0), sellTokenInfo.decimals ?? 0)

  const id = selectedPool.poolId
  const extended = id === hiddenInfoOpenId

  return (
    <ExpandableInfoCard
      key={id}
      header={
        <Header
          onPressArow={() => setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)}
          onPressLabel={navigateTo.selectPool}
          extended={extended}
        >
          <View style={styles.flex}>
            <PoolIcon size={25} providerId={selectedPool.provider} />

            <Spacer width={10} />

            <Text>{`${capitalize(selectedPool.provider)}${isPoolTouched ? '' : ` ${strings.autoPool}`}`}</Text>
          </View>
        </Header>
      }
      adornment={
        <HiddenInfo
          totalFees={getTotalFees(
            selectedPool?.batcherFee.quantity,
            asQuantity(providerFee ?? 0),
            wallet.primaryTokenInfo.decimals ?? 0,
            numberLocale,
          )}
          minReceived={getMinAdaReceiveAfterSlippage(
            amounts.buy.quantity,
            createOrder.slippage,
            buyTokenInfo.decimals ?? 0,
            numberLocale,
          )}
          minAda={Quantities.denominated(selectedPool.deposit.quantity, Number(wallet.primaryTokenInfo.decimals))}
          buyTokenName={tokenName}
        />
      }
      extended={extended}
    >
      <MainInfo totalAmount={totalAmount} tokenName={tokenName} />
    </ExpandableInfoCard>
  )
}

const Header = ({
  children,
  extended,
  onPressArow,
  onPressLabel,
}: {
  children: React.ReactNode
  extended: boolean
  onPressArow: () => void
  onPressLabel: () => void
}) => {
  return (
    <HeaderWrapper extended={extended} onPress={onPressArow}>
      <TouchableOpacity onPress={onPressLabel}>{children}</TouchableOpacity>
    </HeaderWrapper>
  )
}

const HiddenInfo = ({
  totalFees,
  minAda,
  minReceived,
  buyTokenName,
}: {
  totalFees: string
  minAda: string
  minReceived: string
  buyTokenName: string
}) => {
  const [bottomSheetState, setBottomSheetSate] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })
  const strings = useStrings()
  const wallet = useSelectedWallet()

  return (
    <View>
      {[
        {
          label: strings.swapMinAdaTitle,
          value: `${minAda} ${wallet.primaryTokenInfo.ticker}`,
          info: strings.swapMinAda,
        },
        {
          label: strings.swapMinReceivedTitle,
          value: `${minReceived} ${buyTokenName}`,
          info: strings.swapMinReceived,
        },
        {
          label: strings.swapFeesTitle,
          value: `${totalFees} ${wallet.primaryTokenInfo.ticker}`,
          info: strings.swapFees,
        },
      ].map((item) => (
        <HiddenInfoWrapper
          key={item.label}
          value={item.value}
          label={item.label}
          info={item.info}
          onPress={() => {
            setBottomSheetSate({
              isOpen: true,
              title: item.label,
              content: item.info,
            })
          }}
        />
      ))}

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        onClose={() => {
          setBottomSheetSate({isOpen: false, title: '', content: ''})
        }}
      >
        <Text style={styles.text}>{bottomSheetState.content}</Text>
      </BottomSheetModal>
    </View>
  )
}

const MainInfo = ({totalAmount, tokenName}: {totalAmount: string; tokenName: string}) => {
  const strings = useStrings()

  return (
    <View>
      {[{label: `${strings.total} ${totalAmount} ${tokenName} `}].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} isLast={index === 0} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {flexDirection: 'row', alignItems: 'center'},
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
})
