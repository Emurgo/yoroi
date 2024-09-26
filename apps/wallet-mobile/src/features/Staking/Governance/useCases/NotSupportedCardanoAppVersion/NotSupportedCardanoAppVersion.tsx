import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button} from '../../../../../components/Button/Button'
import {SafeArea} from '../../../../../components/SafeArea'
import {Space} from '../../../../../components/Space/Space'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {useWalletNavigation} from '../../../../../kernel/navigation'
import {useStrings} from '../../common/strings'
import {BrokenImage} from '../../illustrations/BrokenImage'

export const NotSupportedCardanoAppVersion = () => {
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()
  const {styles} = useStyles()

  const handleOnPress = () => {
    resetToTxHistory()
  }

  return (
    <SafeArea style={styles.root}>
      <Spacer height={200} />

      <Container>
        <BrokenImage />
      </Container>

      <Space height="lg" />

      <Container>
        <Text style={styles.title}>{strings.notSupportedVersionTitle}</Text>
      </Container>

      <Container>
        <Text style={styles.description}>{strings.notSupportedVersionDescription}</Text>
      </Container>

      <Spacer fill />

      <Actions>
        <Button title={strings.notSupportedVersionButton} onPress={handleOnPress} />
      </Actions>
    </SafeArea>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.actions}>{children}</View>
}
const Container = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.container}>{children}</View>
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.justify_center,
      ...atoms.flex_col,
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    title: {
      ...atoms.heading_3_medium,
      ...atoms.text_center,
      color: color.gray_max,
    },
    description: {
      ...atoms.body_2_md_regular,
      ...atoms.text_center,
      color: color.gray_600,
    },
    actions: {
      ...atoms.p_lg,
    },
    container: {
      ...atoms.px_lg,
      ...atoms.align_center,
    },
  })

  return {styles} as const
}
