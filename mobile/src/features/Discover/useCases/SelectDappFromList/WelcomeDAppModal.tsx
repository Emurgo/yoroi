import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Image, Text} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import IllustrationDAppImage from '~/assets/img/illustration-dapp.png'
import {useShowWelcomeDApp} from '~/features/Discover/common/useShowWelcomeDApp'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

export const WelcomeDAppModal = ({disabled}: {disabled?: boolean}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const insets = useSafeAreaInsets()
  const {openModal, closeModal} = useModal()
  const [seen, setSeen] = useShowWelcomeDApp()
  const [showing, setShowing] = React.useState(false)

  React.useEffect(() => {
    // Only show modal when seen is explicitly false (not undefined, not true)
    // Also wait for seen to be loaded (not undefined)
    if (disabled) {
      return
    }

    if (seen === undefined) {
      return
    }

    if (seen === true) {
      return
    }

    if (showing) {
      return
    }

    setShowing(true)
    openModal({
      title: strings.discover.welcomeToYoroiDAppExplorer,
      content: (
        <Modal.Content>
          <Image
            source={IllustrationDAppImage}
            style={[a.w_full, {height: 200, resizeMode: 'cover'}]}
          />

          <Text
            style={[a.body_1_lg_regular, {color: p.gray_900, marginTop: 16}]}
          >
            {strings.discover.welcomeToYoroiDAppExplorerDescription}
          </Text>
        </Modal.Content>
      ),
      footer: (
        <Modal.Footer>
          <Button
            onPress={async () => {
              await setSeen(true)
              setShowing(false)
              closeModal()
            }}
            title={strings.discover.next}
          />
        </Modal.Footer>
      ),
      height: 530 + insets.bottom,
      canDiscard: false,
    })
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
    p.gray_900,
  ])

  return <></>
}
