import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, Text, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import IllustrationDAppImage from '~/assets/img/illustration-dapp.png'
import {useShowWelcomeDApp} from '~/features/Discover/common/useShowWelcomeDApp'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'

export const WelcomeDAppModal = ({disabled}: {disabled?: boolean}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const insets = useSafeAreaInsets()
  const {openModal, closeModal} = useModal()
  const [seen, setSeen] = useShowWelcomeDApp()
  const [showing, setShowing] = React.useState(false)

  React.useEffect(() => {
    if (disabled || seen || showing) return

    openModal({
      title: strings.discover.welcomeToYoroiDAppExplorer,
      content: (
        <View style={[a.px_lg]}>
          <Image
            source={IllustrationDAppImage}
            style={[a.w_full, {height: 200, resizeMode: 'cover'}]}
          />

          <Text
            style={[a.body_1_lg_regular, {color: p.gray_900, marginTop: 16}]}
          >
            {strings.discover.welcomeToYoroiDAppExplorerDescription}
          </Text>
        </View>
      ),
      footer: (
        <Button
          onPress={() => {
            setSeen(true)
            closeModal()
          }}
          title={strings.discover.next}
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
    strings.discover.next,
    strings.discover.welcomeToYoroiDAppExplorer,
    strings.discover.welcomeToYoroiDAppExplorerDescription,
  ])

  return <></>
}
