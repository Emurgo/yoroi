// @flow

import React from 'react'
import {Button, View} from 'react-native'
import {action} from '@storybook/addon-actions'

import type {Node} from 'react'
export const ModalStoryWrapper = ({children}: {children: ({visible: boolean, onRequestClose: () => any}) => Node}) => {
  const [visible, setVisible] = React.useState(false)

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
        onPress: (name: string) => action(name),
      })}
    </View>
  )
}

export const withModalProps = (Story: any) => <ModalStoryWrapper>{(props) => <Story {...props} />}</ModalStoryWrapper>
