import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import GovernanceIllustration from '~/ui/GovernanceIllustration/GovernanceIllustration'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

export const withdrawGovernanceWarningModalHeight = 1200

const WithdrawGovernanceWarningModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content
      style={[a.flex_1, a.align_center, a.justify_between, a.py_lg]}
    >
      <GovernanceIllustration height={240} width={280} />
      <Text
        style={[
          a.body_1_lg_regular,
          a.justify_center,
          a.text_center,
          ta.text_gray_medium,
        ]}
      >
        {strings.staking.withdrawWarningDescription}
      </Text>
    </Modal.Content>
  )
}

type FooterProps = {
  onDelegateAndWithdraw: () => void
}

const WithdrawGovernanceWarningModalFooter = ({
  onDelegateAndWithdraw,
}: FooterProps) => {
  const walletNavigateTo = useWalletNavigation()
  const strings = useStrings()
  const {closeModal} = useModal()

  const handleGoToGovernanceCenter = React.useCallback(() => {
    closeModal()
    walletNavigateTo.navigateToGovernanceCentre()
  }, [closeModal, walletNavigateTo])

  const handleDelegateAndWithdraw = React.useCallback(() => {
    onDelegateAndWithdraw()
  }, [onDelegateAndWithdraw])

  return (
    <Modal.Footer>
      <Button
        type={ButtonType.Primary}
        title={strings.staking.delegateAndWithdraw}
        onPress={handleDelegateAndWithdraw}
      />

      <Button
        type={ButtonType.Text}
        title={strings.staking.goToGovernanceCenter}
        onPress={handleGoToGovernanceCenter}
      />
    </Modal.Footer>
  )
}

export const WithdrawGovernanceWarningModal = {
  Content: WithdrawGovernanceWarningModalContent,
  Footer: WithdrawGovernanceWarningModalFooter,
}
