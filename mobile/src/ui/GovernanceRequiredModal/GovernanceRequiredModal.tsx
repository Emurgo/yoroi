import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

import GovernanceIllustration from '../GovernanceIllustration/GovernanceIllustration'

export const governanceRequiredModalHeight = 600

const GovernanceRequiredModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content>
      <View style={[a.align_center, a.gap_lg, a.py_lg]}>
        <GovernanceIllustration height={280} width={280} />
        <Text
          style={[
            a.heading_4_regular,
            a.justify_center,
            a.text_center,
            ta.text_gray_max,
          ]}
        >
          {strings.staking.withdrawWarningTitle}
        </Text>
        <Text
          style={[
            a.body_1_lg_regular,
            a.font_thin,
            a.justify_center,
            a.text_center,
            ta.text_gray_medium,
          ]}
        >
          {strings.staking.governanceRequiredDescription}
        </Text>
      </View>
    </Modal.Content>
  )
}

const GovernanceRequiredModalFooter = ({onDelegateStakeOnly}: Props) => {
  const strings = useStrings()

  const handleDelegateStakeOnly = React.useCallback(() => {
    onDelegateStakeOnly()
  }, [onDelegateStakeOnly])

  return (
    <Modal.Footer>
      <Button
        type={ButtonType.Primary}
        title={strings.staking.delegateStakeOnly}
        onPress={handleDelegateStakeOnly}
      />
    </Modal.Footer>
  )
}

export const GovernanceRequiredModal = {
  Content: GovernanceRequiredModalContent,
  Footer: GovernanceRequiredModalFooter,
}

type Props = {
  onDelegateStakeOnly: () => void
}
