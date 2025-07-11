import {useCatalyst} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {InteractionManager, ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAllowScreenshot} from '../../../../hooks/useAllowScreenShot'
import {useBlockGoBack} from '../../../../kernel/navigation'
import {useCopy} from '../../../../kernel/utils/clipboard'
import {Button} from '../../../../ui/Button/Button'
import {Checkbox} from '../../../../ui/Checkbox/Checkbox'
import {ShareQRCodeCard} from '../../../../ui/ShareQRCodeCard/ShareQRCodeCard'
import {Space} from '../../../../ui/Space/Space'
import {useNavigateTo} from '../../CatalystNavigator'
import {Actions, Description} from '../../common/components'
import {useStrings} from '../../common/strings'

export const QrCode = () => {
  useBlockGoBack()
  useAllowScreenshot()
  const strings = useStrings()
  const [checked, setChecked] = React.useState(false)
  const {votingKeyEncrypted, reset} = useCatalyst()
  const navigateTo = useNavigateTo()
  const {color} = useTheme()

  if (votingKeyEncrypted === null)
    throw new Error('votingKeyEncrypted cannot be null')

  const {copy, isCopying} = useCopy()

  const onNext = () => {
    navigateTo.txHistory()

    InteractionManager.runAfterInteractions(() => {
      reset()
    })
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        styles.safeAreaView,
        {backgroundColor: color.bg_color_max},
        a.pb_lg,
      ]}
    >
      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.padding, a.px_lg]}
      >
        <ShareQRCodeCard
          title={strings.step4QrTitle}
          qrContent={votingKeyEncrypted}
          shareContent={votingKeyEncrypted}
          onLongPress={(event) =>
            copy({
              text: votingKeyEncrypted,
              feedback: strings.step4QrCopiedText,
              event,
            })
          }
          shareLabel={strings.step4QrShareLabel}
        />

        <Space height="lg" />

        <Description>{strings.step4Description}</Description>

        <Space height="lg" />

        <Checkbox
          onChange={setChecked}
          checked={checked}
          style={[styles.checkbox, a.align_start]}
          text={strings.step4QrCheckbox}
        />
      </ScrollView>

      <Actions style={[styles.padding, a.px_lg]}>
        <Button
          onPress={onNext}
          title={strings.completeButton}
          disabled={isCopying || !checked}
        />
      </Actions>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  padding: {},
  checkbox: {},
})
