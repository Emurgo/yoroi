// @flow

import {action} from '@storybook/addon-actions'
import type {Node} from 'react'
import React from 'react'
import {Button, View} from 'react-native'

export const WithModalProps = ({
  children,
}: {
  children: ({|visible: boolean, onRequestClose: () => any, onPress: () => any|}) => Node,
}) => {
  const [visible, setVisible] = React.useState(false) // weird behavior when starting with visible: true

  React.useEffect(() => {
    setTimeout(() => setVisible(true), 500) // weird behavior when starting with visible: true
  }, [])

  return (
    // eslint-disable-next-line react-native/no-inline-styles
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
