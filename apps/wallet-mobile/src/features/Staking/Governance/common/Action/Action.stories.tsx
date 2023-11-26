import {storiesOf} from '@storybook/react-native'
import {Action} from './Action'
import {View} from 'react-native'

storiesOf('Governance/Action', module)
  .add('Default', () => <Action title={'Example title'} description={'Example description'} />)
  .add('Pending', () => <Action title={'Example title'} description={'Example description'} pending />)
  .add('With children', () => (
    <Action title={'Example title'} description={'Example description'}>
      <View style={{backgroundColor: 'red', height: 100, width: 100}} />
    </Action>
  ))
  .add('With right arrow', () => <Action title={'Example title'} description={'Example description'} showRightArrow />)
