import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'
import {Text} from 'react-native'

import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

import {useCatalystCurrentFund} from './hooks'

const formatter = amountFormatter({
  template: `{{value}} {{ticker}}`,
  dropTraillingZeros: true,
})

const InsufficientFundsModalContent = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {fund} = useCatalystCurrentFund()
  const {atoms: ta} = useTheme()

  // Default to 0 if fund data is not available yet
  const votingPowerThreshold = fund?.info?.votingPowerThreshold
    ? BigInt(fund.info.votingPowerThreshold)
    : BigInt(0)

  const fmtMinPrimaryBalance = formatter({
    info: wallet.portfolioPrimaryTokenInfo,
    quantity: votingPowerThreshold,
  })
  const fmtPrimaryBalance = formatter(primaryBalance)

  return (
    <Modal.Content>
      <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
        {strings.global.insufficientBalance({
          requiredBalance: fmtMinPrimaryBalance,
          currentBalance: fmtPrimaryBalance,
        })}
      </Text>
    </Modal.Content>
  )
}

const InsufficientFundsModalFooter = () => {
  const strings = useStrings()
  const {closeModal} = useModal()
  return (
    <Modal.Footer>
      <Button title={strings.menu.back} onPress={closeModal} />
    </Modal.Footer>
  )
}

export const InsufficientFundsModal = {
  Content: InsufficientFundsModalContent,
  Footer: InsufficientFundsModalFooter,
}
