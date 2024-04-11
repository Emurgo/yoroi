import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import IllustrationDAppImage from '../../../../assets/img/illustration-dapp.png'
import {Button, useModal} from '../../../../components'
import {useShowWelcomeDApp} from '../../common/useShowWelcomeDApp'
import {useStrings} from '../../common/useStrings'

const DIALOG_WELCOME_DAPP_HEIGHT = 494

export const WelcomeDApp = () => {
  const strings = useStrings()
  const insets = useSafeAreaInsets()
  const {openModal} = useModal()
  const {isShowedWelcomeDApp, setShowedWelcomeDApp, loadingGetShowedWelcomeDApp} = useShowWelcomeDApp()

  const dialogHeight = DIALOG_WELCOME_DAPP_HEIGHT + insets.bottom

  React.useEffect(() => {
    if (loadingGetShowedWelcomeDApp || isShowedWelcomeDApp) return

    openModal(strings.welcomeToYoroiDAppExplorer, <WelcomeDAppModal />, dialogHeight)
    setShowedWelcomeDApp()
  }, [
    dialogHeight,
    isShowedWelcomeDApp,
    loadingGetShowedWelcomeDApp,
    openModal,
    setShowedWelcomeDApp,
    strings.welcomeToYoroiDAppExplorer,
  ])

  return <></>
}

const useStyles = () => {
  const {theme} = useTheme()
  const {typography, color, padding} = theme

  const styles = StyleSheet.create({
    welcomeText: {
      ...typography['body-1-l-regular'],
      color: color.gray['900'],
      marginTop: 16,
    },
    actions: {
      ...padding['y-l'],
    },
    welcomeImage: {
      width: 343,
      height: 200,
    },
  })

  return {styles} as const
}

const WelcomeDAppModal = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {closeModal} = useModal()

  return (
    <View>
      <Image source={IllustrationDAppImage} style={styles.welcomeImage} />

      <Text style={styles.welcomeText}>{strings.welcomeToYoroiDAppExplorerDescription}</Text>

      <View style={styles.actions}>
        <Button shelleyTheme onPress={closeModal} title={strings.next} />
      </View>
    </View>
  )
}
