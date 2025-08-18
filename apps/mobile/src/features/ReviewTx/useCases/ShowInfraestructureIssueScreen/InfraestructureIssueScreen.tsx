import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack} from '~/kernel/navigation/hooks/useBlockGoBack'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {InfraestructureIssueIcon} from '~/ui/InfraestructureIssueIcon/InfraestructureIssueIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

export const InfraestructureIssueScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {resetToTxHistory} = useWalletNavigation()
  const navigation = useNavigation()

  React.useLayoutEffect(() => {
    navigation.setOptions({headerLeft: () => null})
  })

  return (
    <SafeArea
      style={[
        ta.bg_color_max,
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.justify_center,
      ]}
    >
      <Space.Height._2xl />

      <InfraestructureIssueIcon />

      <Space.Height.lg />

      <Text
        style={[ta.text_gray_max, a.heading_3_medium, a.px_sm, a.text_center]}
      >
        {strings.txReview.infraestructureIssueTitle}
      </Text>

      <Text style={[{color: p.gray_600}, a.body_1_lg_regular, a.text_center]}>
        {strings.txReview.infraestructureIssueText}
      </Text>

      <Space.Height._2xs fill />

      <Actions>
        <Button
          onPress={resetToTxHistory}
          title={strings.txReview.infraestructureIssueButton}
          style={a.px_lg}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: React.PropsWithChildren) => {
  return <View style={a.self_stretch}>{children}</View>
}
