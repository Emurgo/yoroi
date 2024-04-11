import {useFocusEffect} from '@react-navigation/native'
import {isBoolean} from '@yoroi/common'
import {isEmpty} from 'lodash'
import React from 'react'
import {Platform} from 'react-native'

import {useScreenShareSettingEnabled} from '../features/Settings/ScreenShare'
import {changeScreenShareNativeSettingOnAndroid} from '../features/Settings/ScreenShare/ScreenShare'

export function isEmptyString(value: string | null | undefined): value is '' | null | undefined {
  return isEmpty(value)
}

export function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let rejectedCount = 0
    for (const promise of promises) {
      promise.then(resolve).catch(() => {
        rejectedCount++
        if (rejectedCount === promises.length) {
          reject(new Error('All promises were rejected'))
        }
      })
    }
  })
}

export const useAllowScreenshots = () => {
  const {data: screenShareSettingEnabled} = useScreenShareSettingEnabled()
  const callback = React.useCallback(() => {
    if (Platform.OS !== 'android') return
    if (!isBoolean(screenShareSettingEnabled) || screenShareSettingEnabled) return

    changeScreenShareNativeSettingOnAndroid(true)
    return () => {
      changeScreenShareNativeSettingOnAndroid(false)
    }
  }, [screenShareSettingEnabled])
  useFocusEffect(callback)
}

export const makeList = (length = 0) => Array.from({length}).fill(1)
