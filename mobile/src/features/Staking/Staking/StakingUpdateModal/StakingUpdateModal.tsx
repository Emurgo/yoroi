import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {StakingUpdateIllustration} from '~/ui/StakingUpdateIllustration/StakingUpdateIllustration'

const STAKING_UPDATE_LEARN_MORE_URL =
  'https://help.yoroi-wallet.com/en/article/upcoming-update-to-emurgo-and-yoroi-stake-pools-1giae8b/'

const StakingUpdateModalContent = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Modal.Content>
      <View style={[a.align_center, a.px_lg]}>
        <StakingUpdateIllustration width={280} height={280} />

        <Space.Height.xl />

        <Text
          style={[
            a.heading_3_medium,
            {color: p.gray_900, textAlign: 'center'},
            a.pb_md,
          ]}
        >
          {strings.staking.stakingUpdateHeading}
        </Text>

        <Text
          style={[
            a.body_1_lg_regular,
            {color: p.gray_600, textAlign: 'center'},
          ]}
        >
          {strings.staking.stakingUpdateDescription}
        </Text>
      </View>
    </Modal.Content>
  )
}

const StakingUpdateModalFooter = () => {
  const strings = useStrings()
  const {closeModal} = useModal()

  const handleSkip = () => {
    closeModal()
  }

  const handleLearnMore = () => {
    closeModal()
    Linking.openURL(STAKING_UPDATE_LEARN_MORE_URL)
  }

  return (
    <Modal.Footer>
      <Button
        type={ButtonType.Primary}
        title={strings.staking.skip}
        onPress={handleSkip}
      />

      <Button
        type={ButtonType.SecondaryText}
        title={strings.manageCollateral.learnMore}
        onPress={handleLearnMore}
      />
    </Modal.Footer>
  )
}

export const StakingUpdateModal = {
  Content: StakingUpdateModalContent,
  Footer: StakingUpdateModalFooter,
}
