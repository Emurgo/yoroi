import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

export const CollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Modal.Content>
      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.manageCollateral.collateralInfoModalText}
      </Text>
    </Modal.Content>
  )
}
