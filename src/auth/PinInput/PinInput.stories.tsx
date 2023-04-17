import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button} from '../../components'
import {CONFIG} from '../../legacy/config'
import {PinInput, PinInputRef} from './PinInput'

const PinInputWrapper = ({enabled = true}: {enabled?: boolean}) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <View style={styles.button}>
        <Button title="Clean Pin" onPress={() => pinInputRef.current?.clear()} />
      </View>

      <PinInput
        ref={pinInputRef}
        enabled={enabled}
        pinMaxLength={CONFIG.PIN_LENGTH}
        title={strings.title}
        onDone={action('onDone')}
      />
    </View>
  )
}

storiesOf('PinInput', module)
  .add('Default', () => <PinInputWrapper />)
  .add('Disabled', () => <PinInputWrapper enabled={false} />)

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  button: {
    padding: 10,
  },
})
