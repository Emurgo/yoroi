import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import IllustrationDAppImage from '../../../../assets/img/illustration-dapp.png'
import {Button} from '../../../../components/Button/Button'
import {useModal} from '../../../../components/Modal/ModalContext'
import {useShowWelcomeDApp} from '../../common/useShowWelcomeDApp'
import {useStrings} from '../../common/useStrings'

export const WelcomeDAppModal = ({disabled}: {disabled?: boolean}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const insets = useSafeAreaInsets()
  const {openModal, closeModal} = useModal()
  const [seen, setSeen] = useShowWelcomeDApp()
  const [showing, setShowing] = React.useState(false)

  React.useEffect(() => {
    if (disabled || seen || showing) return

    openModal({
      title: strings.welcomeToYoroiDAppExplorer,
      content: (
        <View style={styles.container}>
          <Image source={IllustrationDAppImage} style={styles.welcomeImage} />

          <Text style={styles.welcomeText}>{strings.welcomeToYoroiDAppExplorerDescription}</Text>
        </View>
      ),
      footer: (
        <Button
          onPress={() => {
            setSeen(true)
            closeModal()
          }}
          title={strings.next}
        />
      ),
      height: 530 + insets.bottom,
      canDiscard: false,
    })
    setShowing(true)
  }, [
    closeModal,
    disabled,
    insets.bottom,
    openModal,
    seen,
    setSeen,
    showing,
    strings.next,
    strings.welcomeToYoroiDAppExplorer,
    strings.welcomeToYoroiDAppExplorerDescription,
    styles.container,
    styles.welcomeImage,
    styles.welcomeText,
  ])

  return <></>
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    welcomeText: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
      marginTop: 16,
    },
    welcomeImage: {
      ...atoms.w_full,
      height: 200,
      resizeMode: 'cover',
    },
    container: {
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
