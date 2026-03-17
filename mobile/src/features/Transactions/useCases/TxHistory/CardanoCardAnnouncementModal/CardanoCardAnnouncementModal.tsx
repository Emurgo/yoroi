import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {CardAnnouncementIllustration} from '~/ui/CardAnnouncementIllustration/CardAnnouncementIllustration'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

const CARDANO_CARD_URL = 'https://cardanocard.io/'

const CardanoCardAnnouncementModalContent = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Modal.Content>
      <View style={[a.align_center, a.px_lg, a.pt_lg]}>
        <CardAnnouncementIllustration width={328} height={246} />

        <Space.Height.md />

        <Text
          style={[
            a.body_1_lg_regular,
            {color: p.gray_600, textAlign: 'center'},
          ]}
        >
          {strings.staking.cardanoCardAnnouncementDescription}
        </Text>
      </View>
    </Modal.Content>
  )
}

const CardanoCardAnnouncementModalFooter = () => {
  const strings = useStrings()
  const {closeModal} = useModal()

  const handleSkip = () => {
    closeModal()
  }

  const handleLearnMore = () => {
    closeModal()
    Linking.openURL(CARDANO_CARD_URL)
  }

  return (
    <Modal.Footer>
      <Button
        type={ButtonType.Primary}
        title={strings.staking.cardanoCardAnnouncementButton}
        onPress={handleLearnMore}
      />

      <Button
        type={ButtonType.SecondaryText}
        title={strings.staking.skip}
        onPress={handleSkip}
      />
    </Modal.Footer>
  )
}

export const CardanoCardAnnouncementModal = {
  Content: CardanoCardAnnouncementModalContent,
  Footer: CardanoCardAnnouncementModalFooter,
}
