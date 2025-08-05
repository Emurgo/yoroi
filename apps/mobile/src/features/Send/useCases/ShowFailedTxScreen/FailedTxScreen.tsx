import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {FailedTxIcon} from '../ReviewTx/illustrations/FailedTxIcon'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {resetToStartTransfer} = useWalletNavigation()

  return (
    <SafeArea
      style={[
        {
          backgroundColor: p.bg_color_max,
          padding: 16,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
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
