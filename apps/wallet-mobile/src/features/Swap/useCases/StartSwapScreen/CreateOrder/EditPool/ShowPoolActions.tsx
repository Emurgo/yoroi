import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {
  ExpandableInfoCard,
  HeaderWrapper,
  HiddenInfoWrapper,
  MainInfoWrapper,
  Spacer,
} from '../../../../../../components'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../common/navigation'
import {PoolIcon} from '../../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

export const ShowPoolActions = () => {
  const navigateTo = useNavigateTo()
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
  const protocolCapitalize = selectedPool.provider[0].toUpperCase() + selectedPool.provider.substring(1)
  const calculatedFee = (Number(selectedPool?.fee) / 100) * Number(createOrder.amounts.sell.quantity)
  const poolFee = Quantities.format(`${calculatedFee}`, sellTokenInfo.decimals ?? 0)

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

            <Text>{`${protocolCapitalize}${isPoolTouched ? '' : ` ${strings.autoPool}`}`}</Text>
          </View>
        </Header>
      }
      adornment={<HiddenInfo poolFee={poolFee} />}
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

const HiddenInfo = ({poolFee}: {poolFee: string}) => {
  const strings = useStrings()
  return (
    <View>
      {[
        {
          label: strings.swapMinAdaTitle,
          value: '2 ADA',
          info: strings.swapMinAda,
        },
        {
          label: strings.swapMinReceivedTitle,
          value: '2.99 USDA', // TODO add real value
          info: strings.swapMinReceived,
        },
        {
          label: strings.swapFeesTitle,
          value: String(poolFee),
          info: strings.swapFees,
        },
      ].map((item) => (
        <HiddenInfoWrapper key={item.label} value={item.value} label={item.label} info={item.info} />
      ))}
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
})
