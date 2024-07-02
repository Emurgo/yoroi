import * as React from 'react'
import {Text, View} from 'react-native'

export const SuspenseBoundary = ({children}: {children: React.ReactNode}) => {
  return (
    <React.Suspense
      fallback={
        <View testID="suspending">
          <Text>suspending</Text>
        </View>
      }
    >
      {children}
    </React.Suspense>
  )
}
