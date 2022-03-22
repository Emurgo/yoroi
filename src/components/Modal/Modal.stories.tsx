import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'

import {WithModalProps} from '../../../storybook'
import {Modal} from './Modal'

storiesOf('Modal', module)
  .add('Default', () => (
    <WithModalProps>
      {(modalProps) => (
        <Modal {...modalProps}>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
        </Modal>
      )}
    </WithModalProps>
  ))
  .add('with title', () => (
    <WithModalProps>
      {(modalProps) => (
        <Modal {...modalProps} title={'This is the title'}>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
        </Modal>
      )}
    </WithModalProps>
  ))
  .add('with close button', () => (
    <WithModalProps>
      {(modalProps) => (
        <Modal {...modalProps} showCloseIcon>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
        </Modal>
      )}
    </WithModalProps>
  ))
  .add('no padding', () => (
    <WithModalProps>
      {(modalProps) => (
        <Modal {...modalProps} noPadding>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
        </Modal>
      )}
    </WithModalProps>
  ))
  .add('closes on blur', () => (
    // <NavigationContext.Provider
    //   value={{
    //     ...navigation,
    //     addListener: (event, callback) => {
    //       setTimeout(() => action('addListener')(event), 1000)
    //       if (event === 'blur') {
    //         setTimeout(() => callback({type: event}), 2000)
    //       }

    //       return () => undefined
    //     },
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   }}
    // >
    <WithModalProps>
      {(modalProps) => (
        <Modal {...modalProps}>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
        </Modal>
      )}
    </WithModalProps>
    // </NavigationContext.Provider>
  ))
