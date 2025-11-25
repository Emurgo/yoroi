import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

import GovernanceIllustration from '../GovernanceIllustration/GovernanceIllustration'

export const governanceRequiredModalHeight = 600

const GovernanceRequiredModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content
      style={[a.flex_1, a.align_center, a.justify_between, a.py_lg]}
    >
      <GovernanceIllustration height={280} width={280} />
      <Text
        style={[
          a.body_1_lg_regular,
          a.justify_center,
          a.text_center,
          ta.text_gray_medium,
        ]}
      >
        {strings.staking.governanceRequiredDescription}
      </Text>
    </Modal.Content>
  )
}

const GovernanceRequiredModalFooter = ({
  onDelegateToYoroiDRep,
  onDelegateStakeOnly,
}: Props) => {
  const strings = useStrings()

  const handleDelegateToYoroiDRep = React.useCallback(() => {
    onDelegateToYoroiDRep()
  }, [onDelegateToYoroiDRep])

  const handleDelegateStakeOnly = React.useCallback(() => {
    onDelegateStakeOnly()
  }, [onDelegateStakeOnly])

  return (
    <Modal.Footer>
      <Button
        type={ButtonType.Primary}
        title={strings.staking.delegateToYoroiDRep}
        onPress={handleDelegateToYoroiDRep}
      />

      <Button
        type={ButtonType.Text}
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
  onDelegateToYoroiDRep: () => void
  onDelegateStakeOnly: () => void
}
