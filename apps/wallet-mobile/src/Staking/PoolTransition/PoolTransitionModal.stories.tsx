import {PoolInfo} from '@emurgo/yoroi-lib'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {PoolTransitionModal} from './usePoolTransition'

const mock = {
  currentPool: {
    pic: 'https://img.cexplorer.io/a/5/5/f/2/pool12eht6dqxpzqj87xuextrpufz2gxmt4reuesuw26r2utzw0kw906.png',
    ticker: 'EMRG',
    name: 'emurgo old',
    roa: '0',
    tax: '3.5',
  } as unknown as PoolInfo & {tax: number},
  suggestedPool: {
    pic: 'https://img.cexplorer.io/e/c/2/3/1/pool1dkww2vlysa8lsnuf5rca979zdsyr3zvt59hu7e420yxfunkka2z.png',
    id: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207',
    name: 'emurgo new',
    roa: '5.1',
    ticker: 'EMRG',
    tax: '3.2',
  } as unknown as PoolInfo & {tax: number},
  deadlineMilliseconds: 2999777000,
}

storiesOf('PoolTransitionModal', module)
  .add('Future deadline', () => (
    <View style={{flex: 1, justifyContent: 'flex-end'}}>
      <View style={{height: 600, padding: 8}}>
        <PoolTransitionModal onContinue={action('Navigate')} poolTransition={mock} />
      </View>
    </View>
  ))
  .add('Past deadline', () => (
    <View style={{flex: 1, justifyContent: 'flex-end'}}>
      <View style={{height: 600, padding: 8}}>
        <PoolTransitionModal onContinue={action('Navigate')} poolTransition={{...mock, deadlineMilliseconds: 0}} />
      </View>
    </View>
  ))
