import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {ColateralIlustration} from '../../../illustrations/ColateralIlustration'

export const InitialCollateralInfoModal = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Modal.Content>
      <View style={[a.align_center]}>
        <ColateralIlustration />
      </View>

      <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.manageCollateral.collateralInfoModalText}
      </Text>

      <Space.Height.md />

      <Link />
    </Modal.Content>
  )
}

export const InitialCollateralInfoModalFooter = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) => {
  const strings = useStrings()
  return (
    <Modal.Footer>
      <Button
        title={strings.manageCollateral.cancel}
        onPress={onCancel}
        type={ButtonType.Secondary}
      />
      <Button
        title={strings.manageCollateral.initialCollateralInfoModalButton}
        onPress={onConfirm}
      />
    </Modal.Footer>
  )
}

const learnMoreLink = 'https://help.yoroi-wallet.com/en/'

const Link = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const handleOnPress = () => {
    Linking.openURL(learnMoreLink)
  }

  return (
    <Text
      style={[a.link_1_lg_underline, ta.text_primary_medium]}
      onPress={handleOnPress}
    >
      {strings.manageCollateral.learnMore}.
    </Text>
  )
}
