import {useCatalyst} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {InteractionManager, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {Checkbox} from '~/ui/Checkbox/Checkbox'
import {Actions, Description} from '~/ui/common/components'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
import {Space} from '~/ui/Space/Space'
import {useNavigateTo} from '../CatalystNavigator'
import {useAllowScreenshot} from '../hooks/useAllowScreenShot'

export const QrCode = () => {
  useBlockGoBack()
  useAllowScreenshot()
  const strings = useStrings()
  const [checked, setChecked] = React.useState(false)
  const {votingKeyEncrypted, reset} = useCatalyst()
  const navigateTo = useNavigateTo()
  const {palette: p} = useTheme()

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
      style={[a.flex_1, {backgroundColor: p.bg_color_max}, a.pb_lg]}
    >
      <ScrollView bounces={false} contentContainerStyle={[a.px_lg]}>
        <ShareQRCodeCard
          title={strings.registerCatalyst.step4QrTitle}
          qrContent={votingKeyEncrypted}
          shareContent={votingKeyEncrypted}
          onLongPress={(event) =>
            copy({
              text: votingKeyEncrypted,
              feedback: strings.registerCatalyst.step4QrCopiedText,
              event,
            })
          }
          shareLabel={strings.registerCatalyst.step4QrShareLabel}
        />

        <Space.Height.lg />

        <Description>{strings.registerCatalyst.step4Description}</Description>

        <Space.Height.lg />

        <Checkbox
          onChange={setChecked}
          checked={checked}
          style={[a.align_start]}
          text={strings.registerCatalyst.step4QrCheckbox}
        />
      </ScrollView>

      <Actions style={[a.px_lg]}>
        <Button
          onPress={onNext}
          title={strings.registerCatalyst.confirm}
          disabled={isCopying || !checked}
        />
      </Actions>
    </SafeAreaView>
  )
}
