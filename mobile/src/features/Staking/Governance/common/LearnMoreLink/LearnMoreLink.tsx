import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {Linking, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'

const LEARN_MORE_LINK =
  'https://help.yoroi-wallet.com/en/article/how-can-i-participate-in-governance-through-yoroi-155o8l3/'

export const LearnMoreLink = () => {
  const strings = useStrings()

  const handleOnPress = () => {
    Linking.openURL(LEARN_MORE_LINK)
  }

  if (LEARN_MORE_LINK.length === 0) return null

  return (
    <View style={a.align_center}>
      <Button
        title={strings.staking.learnMoreAboutGovernance}
        type={ButtonType.Link}
        onPress={handleOnPress}
      />
    </View>
  )
}
