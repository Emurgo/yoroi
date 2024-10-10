import {isBoolean, parseSafe, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {Boundary} from '../../../components/Boundary/Boundary'
import {Button} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Space} from '../../../components/Space/Space'
import {Spacer} from '../../../components/Spacer/Spacer'
import {time} from '../../../kernel/constants'
import {NetworkPickerList} from './NetworkPickerList'
import {useStrings} from './strings'

export const ChangeNetworkScreen = () => {
  const styles = useStyles()
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

  const handleOpenModal = () => {
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

        {Platform.OS === 'android' && <Space height="lg" />}
      </View>,
      450,
      () => handleOnClose(),
    )
  }

  return {handleOpenModal}
}

const useSetNetworkNoticeShown = (options?: UseMutationOptions<void, Error, void>) => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: () => storage.join('appSettings/').setItem('networkNoticeShown', true),
    invalidateQueries: [['useSetShowNetworkNoticeInfo']],
    ...options,
  })

  return mutation.mutate
}

const useNetworkNoticeShown = (options?: UseQueryOptions<boolean, Error, boolean>) => {
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
      backgroundColor: color.bg_color_max,
    },
    modal: {
      flex: 1,
      ...atoms.px_lg,
    },
    modalText: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    modalTextTitle: {
      ...atoms.body_1_lg_medium,
      color: color.gray_900,
    },
    actions: {
      ...atoms.pt_lg,
    },
  })

  return styles
}
