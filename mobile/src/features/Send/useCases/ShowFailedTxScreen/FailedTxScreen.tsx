import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack} from '~/kernel/navigation/hooks/useBlockGoBack'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {FailedTxIcon} from '~/ui/FailedTxIcon/FailedTxIcon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const {resetToStartTransfer} = useWalletNavigation()

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

      <FailedTxIcon />

      <Space.Height._2xl />

      <Space.Height.lg />

      <Text
        style={[
          {
            color: p.gray_max,
            fontSize: 24,
            fontWeight: '600',
            paddingHorizontal: 8,
            textAlign: 'center',
          },
        ]}
      >
        {strings.send.failedTxTitle}
      </Text>

      <Text
        style={[
          {
            color: p.gray_600,
            fontSize: 16,
            lineHeight: 24,
            fontWeight: '400',
            textAlign: 'center',
          },
        ]}
      >
        {strings.send.failedTxText}
      </Text>

      <View style={{flex: 1}} />

      <Actions>
        <Button
          onPress={resetToStartTransfer}
          title={strings.send.failedTxButton}
          style={[{paddingHorizontal: 16}]}
        />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  return <View style={{alignSelf: 'stretch'}}>{children}</View>
}
