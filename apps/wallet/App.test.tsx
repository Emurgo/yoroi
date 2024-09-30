import * as React from 'react'
import {it} from '@jest/globals'
import {render} from '@testing-library/react-native'

import {App} from './App'

it('renders correctly', () => {
  const {getByTestId} = render(<App />)
  const app = getByTestId('app')
  expect(app).toBeDefined()
})
