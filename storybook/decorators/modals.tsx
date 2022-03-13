import {action} from '@storybook/addon-actions'

import React from 'react'
import {Button, View} from 'react-native'

type childrenFn = (modalProps: {
  visible: boolean
  onRequestClose: () => void
  onPress: typeof action
}) => React.ReactNode

export const WithModalProps = ({children, autoClose}: {children: childrenFn, autoClose?: boolean}) => {
  const [visible, setVisible] = React.useState(false) // weird behavior when starting with visible: true

  React.useEffect(() => {
    setTimeout(() => setVisible(true), 500) // weird behavior when starting with visible: true
    autoClose && setTimeout(() => setVisible(false), 3500) // auto-close
  }, [])

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button onPress={() => setVisible(true)} title={'show modal'} />

      {children({
        visible,
        onRequestClose: () => {
          action('onRequestClose')()
          setVisible(false)
        },
        onPress: action,
      })}
    </View>
  )
}

export const withModalProps = (Story: any) => <WithModalProps>{(props) => <Story {...props} />}</WithModalProps>
