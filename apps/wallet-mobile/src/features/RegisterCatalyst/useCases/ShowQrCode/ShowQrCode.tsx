import {useCatalyst} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Checkbox} from '../../../../components'
import {ShareQRCodeCard} from '../../../../components/ShareQRCodeCard/ShareQRCodeCard'
import {Space} from '../../../../components/Space/Space'
import {useAllowScreenshot} from '../../../../hooks/useAllowScreenShot'
import {useCopy} from '../../../../hooks/useCopy'
import {useBlockGoBack} from '../../../../kernel/navigation'
import {useNavigateTo} from '../../CatalystNavigator'
import {Actions, Description, Stepper} from '../../common/components'
import {useStrings} from '../../common/strings'

export const QrCode = () => {
  useBlockGoBack()
  useAllowScreenshot()
  const strings = useStrings()
  const styles = useStyles()
  const [checked, setChecked] = React.useState(false)
  const {votingKeyEncrypted} = useCatalyst()
  const navigateTo = useNavigateTo()

  if (votingKeyEncrypted === null) throw new Error('votingKeyEncrypted cannot be null')

  const [isCopying, copy] = useCopy()
  const handOnCopy = () => copy(votingKeyEncrypted)

  const onNext = () => {
    navigateTo.txHistory()
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <Stepper currentStep={4} totalSteps={4} title={strings.step4Title} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <ShareQRCodeCard
          title={strings.step4QrTitle}
          content={votingKeyEncrypted}
          onLongPress={handOnCopy}
          shareLabel={strings.step4QrShareLabel}
          copiedText={strings.step4QrCopiedText}
        />

        <Space height="lg" />

        <Description>{strings.step4Description}</Description>

        <Space height="lg" />

        <Checkbox onChange={setChecked} checked={checked} style={styles.checkbox} text={strings.step4QrCheckbox} />
      </ScrollView>

      <Actions>
        <Button shelleyTheme onPress={onNext} title={strings.completeButton} disabled={isCopying || !checked} />
      </Actions>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
    contentContainer: {
      ...atoms.px_lg,
    },
    checkbox: {
      alignItems: 'flex-start',
      flex: 1,
    },
  })

  return styles
}
