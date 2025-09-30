import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

const WithdrawGovernanceWarningModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content>
      <Text
        style={[
          a.body_1_lg_regular,
          a.text_center,
          a.font_normal,
          ta.text_gray_medium,
        ]}
      >
        {strings.staking.withdrawWarningDescription}
      </Text>
    </Modal.Content>
  )
}

const WithdrawGovernanceWarningModalFooter = () => {
  const walletNavigateTo = useWalletNavigation()
  const strings = useStrings()
  const handleOnPress = () => {
    walletNavigateTo.navigateToGovernanceCentre()
  }

  return (
    <Modal.Footer>
      <Button
        title={strings.staking.withdrawWarningButton}
        onPress={handleOnPress}
      />
    </Modal.Footer>
  )
}

export const WithdrawGovernanceWarningModal = {
  Content: WithdrawGovernanceWarningModalContent,
  Footer: WithdrawGovernanceWarningModalFooter,
}
