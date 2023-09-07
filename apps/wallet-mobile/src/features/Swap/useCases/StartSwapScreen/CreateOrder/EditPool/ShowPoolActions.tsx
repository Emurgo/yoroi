import {useSwap} from '@yoroi/swap'
import React from 'react'
import {View} from 'react-native'

import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../common/navigation'
import {
  BottomSheetState,
  ExpandableInfoCard,
  HiddenInfoWrapper,
  MainInfoWrapper,
} from '../../../../common/SelectPool/ExpendableCard/ExpandableInfoCard'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../TouchedContext'

export const ShowPoolActions = () => {
  const navigateTo = useNavigateTo()
  const {createOrder} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const {selectedPool, amounts} = createOrder
  const wallet = useSelectedWallet()
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const tokenName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const [bottomSheetState, setBottomSheetState] = React.useState<BottomSheetState>({
    openId: null,
    title: '',
    content: '',
  })
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  if (!isBuyTouched || !isSellTouched || selectedPool === undefined) {
    return <></>
  }

  const totalAmount = Quantities.format(amounts.buy.quantity, buyTokenInfo.decimals ?? 0)
  const protocolCapitalize = selectedPool.provider[0].toUpperCase() + selectedPool.provider.substring(1)
  const calculatedFee = (Number(selectedPool?.fee) / 100) * Number(createOrder.amounts.sell.quantity)
  const poolFee = Quantities.format(`${calculatedFee}`, sellTokenInfo.decimals ?? 0)

  const id = selectedPool.poolId

  return (
    <ExpandableInfoCard
      id={id}
      key={id}
      bottomSheetState={bottomSheetState}
      setBottomSheetState={setBottomSheetState}
      setHiddenInfoOpenId={setHiddenInfoOpenId}
      hiddenInfoOpenId={hiddenInfoOpenId}
      label={`${protocolCapitalize} (auto)`}
      mainInfo={<MainInfo totalAmount={totalAmount} tokenName={tokenName} />}
      navigateTo={() => navigate.selectPool()}
      hiddenInfo={<HiddenInfo id={id} poolFee={poolFee} setBottomSheetState={setBottomSheetState} />}
    />
  )
}

const HiddenInfo = ({
  id,
  poolFee,
  setBottomSheetState,
}: {
  id: string
  poolFee: string
  setBottomSheetState: (state: BottomSheetState) => void
}) => {
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
        <HiddenInfoWrapper
          key={item.label}
          value={item.value}
          label={item.label}
          info={item.info}
          onPress={() => {
            setBottomSheetState({
              openId: id,
              title: item.label,
              content: item.info,
            })
          }}
        />
      ))}
    </View>
  )
}

const MainInfo = ({totalAmount, tokenName}: {totalAmount: string; tokenName: string}) => {
  return (
    <View>
      {[{label: `Total ${totalAmount} ${tokenName} `}].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} isLast={index === 0} />
      ))}
    </View>
  )
}
