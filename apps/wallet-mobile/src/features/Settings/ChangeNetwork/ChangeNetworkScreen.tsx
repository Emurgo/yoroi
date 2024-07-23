import {isBoolean, parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {Boundary, Button, Spacer, useModal} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {time} from '../../../kernel/constants'
import {NetworkPickerList} from './NetworkPickerList'
import {useStrings} from './strings'

export const ChangeNetworkScreen = () => {
  const styles = useStyles()
  const strings = useStrings()
  const {networkNoticeShown} = useNetworkNoticeShown()

  const {handleOpenModal} = useHandleOpenNetworkNoticeModal()

  React.useEffect(() => {
    if (!networkNoticeShown) {
      const timeout = setTimeout(handleOpenModal, time.seconds(0.5))

      return () => clearTimeout(timeout)
    }
  }, [handleOpenModal, networkNoticeShown])

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.safeAreaView}>
      <Boundary>
        <NetworkPickerList />
      </Boundary>

      <View style={{padding: 16}}>
        <Button shelleyTheme title={strings.apply} />
      </View>
    </SafeAreaView>
  )
}

export const useHandleOpenNetworkNoticeModal = () => {
  const styles = useStyles()
  const strings = useStrings()
  const {openModal, closeModal} = useModal()
  const {refetch} = useNetworkNoticeShown()
  const {networkNoticeShown} = useNetworkNoticeShown()

  const setNetworkNoticeShown = useSetNetworkNoticeShown({
    onSuccess: () => refetch(),
  })

  const handleOnClose = React.useCallback(() => {
    if (!networkNoticeShown) setNetworkNoticeShown()
  }, [networkNoticeShown, setNetworkNoticeShown])

  const handleOpenModal = React.useCallback(() => {
    openModal(
      strings.networkNoticeTitle,
      <View style={styles.modal}>
        <Text style={styles.modalText}>{strings.networkNoticeMessage}</Text>

        <Space height="lg" />

        <Text style={styles.modalTextTitle}>{strings.networkNoticeListTitle}</Text>

        <Text style={styles.modalText}>{strings.networkNoticeList}</Text>

        <Spacer fill />

        <View style={styles.actions}>
          <Button
            shelleyTheme
            title={strings.networkNoticeButton}
            onPress={() => {
              closeModal()
            }}
          />
        </View>
      </View>,
      450,
      () => handleOnClose(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {handleOpenModal}
}

export const useSetNetworkNoticeShown = (options?: UseMutationOptions<void, Error, void>) => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: () => storage.join('appSettings/').setItem('networkNoticeShown', true),
    invalidateQueries: [['useSetShowNetworkNoticeInfo']],
    ...options,
  })

  return mutation.mutate
}

export const useNetworkNoticeShown = (options?: UseQueryOptions<boolean, Error, boolean>) => {
  const storage = useAsyncStorage()

  const query = useQuery({
    suspense: true,
    queryKey: ['useNetworkNoticeShown'],
    ...options,
    queryFn: async () => {
      const result = await storage.join('appSettings/').getItem('networkNoticeShown')
      const parsed = parseSafe(result)
      return isBoolean(parsed) ? parsed : false
    },
  })

  return {
    ...query,
    networkNoticeShown: query.data,
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
    modal: {
      flex: 1,
      ...atoms.px_lg,
    },
    modalText: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    modalTextTitle: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
    },
    actions: {
      ...atoms.py_lg,
    },
  })

  return styles
}
