import {useSwap} from '@yoroi/swap'
import React from 'react'

import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../common/navigation'
import {
  ExpandableInfoCard,
  HiddenInfoWrapper,
  MainInfoWrapper,
} from '../../../../common/SelectPool/ExpendableCard/ExpandableInfoCard'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../TouchedContext'

export const ShowPoolActions = () => {
  const navigate = useNavigateTo()
  const {createOrder} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const {selectedPool, amounts} = createOrder
  const wallet = useSelectedWallet()
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const tokenName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const [showHiddenInfo, setShowHiddenInfo] = React.useState(false)
  const [bottomSheetState, setBottomSheetState] = React.useState<{
    isOpen: boolean
    title: string
    content?: React.ReactNode
  }>({
    isOpen: false,
    title: '',
    content: '',
  })

  if (!isBuyTouched || !isSellTouched || selectedPool === undefined) {
    return <></>
  }

  const totalAmount = Quantities.format(amounts.buy.quantity, buyTokenInfo.decimals ?? 0)
  const protocolCapitalize = selectedPool.provider[0].toUpperCase() + selectedPool.provider.substring(1)
  return (
    <ExpandableInfoCard
      showHiddenInfo={showHiddenInfo}
      setShowHiddenInfo={setShowHiddenInfo}
      bottomSheetState={bottomSheetState}
      setBottomSheetState={setBottomSheetState}
      label={`${protocolCapitalize} (auto)`}
      mainInfo={<MainInfo totalAmount={totalAmount} tokenName={tokenName} />}
      navigateTo={() => navigate.selectPool()}
      hiddenInfo={<HiddenInfo poolFee={poolFee} setBottomSheetState={setBottomSheetState} />}
    />
  )
}

const HiddenInfo = ({
  poolFee,
  setBottomSheetState,
}: {
  poolFee: string
  setBottomSheetState: (bottomSheetState: {isOpen: boolean; title: string; content?: React.ReactNode}) => void
}) => {
  const strings = useStrings()
  return (
    <>
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
          value: String(selectedPool?.fee),
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
              isOpen: true,
              title: item.label,
              content: item.info,
            })
          }}
        />
      ))}
    </>
  )
}

const MainInfo = ({totalAmount, tokenName}: {totalAmount: string; tokenName: string}) => {
  return (
    <>
      {[{label: `Total ${totalAmount} ${tokenName} `}].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} isLast={index === 0} />
      ))}
    </>
  )
}
