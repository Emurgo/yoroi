import {useCatalyst} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {InteractionManager, ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {Checkbox} from '../../../../components/Checkbox/Checkbox'
import {ShareQRCodeCard} from '../../../../components/ShareQRCodeCard/ShareQRCodeCard'
import {Space} from '../../../../components/Space/Space'
import {useAllowScreenshot} from '../../../../hooks/useAllowScreenShot'
import {useCopy} from '../../../../hooks/useCopy'
import {useBlockGoBack} from '../../../../kernel/navigation'
import {useNavigateTo} from '../../CatalystNavigator'
import {Actions, Description} from '../../common/components'
import {useStrings} from '../../common/strings'

export const QrCode = () => {
  useBlockGoBack()
  useAllowScreenshot()
  const strings = useStrings()
  const styles = useStyles()
  const [checked, setChecked] = React.useState(false)
  const {votingKeyEncrypted, reset} = useCatalyst()
  const navigateTo = useNavigateTo()

  if (votingKeyEncrypted === null) throw new Error('votingKeyEncrypted cannot be null')

  const [isCopying, copy] = useCopy()
  const handleOnCopy = () => copy(votingKeyEncrypted)

  const onNext = () => {
    navigateTo.txHistory()

    InteractionManager.runAfterInteractions(() => {
      reset()
    })
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView bounces={false} contentContainerStyle={styles.padding}>
        <ShareQRCodeCard
          title={strings.step4QrTitle}
          qrContent={votingKeyEncrypted}
          shareContent={votingKeyEncrypted}
          onLongPress={handleOnCopy}
          shareLabel={strings.step4QrShareLabel}
          copiedText={strings.step4QrCopiedText}
        />

        <Space height="lg" />

        <Description>{strings.step4Description}</Description>

        <Space height="lg" />

        <Checkbox onChange={setChecked} checked={checked} style={styles.checkbox} text={strings.step4QrCheckbox} />
      </ScrollView>

      <Actions style={styles.padding}>
        <Button shelleyTheme onPress={onNext} title={strings.completeButton} disabled={isCopying || !checked} />
      </Actions>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.pb_lg,
    },
    padding: {
      ...atoms.px_lg,
    },
    checkbox: {
      ...atoms.align_start,
    },
  })

  return styles
}
