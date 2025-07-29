import {
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import {
  isBoolean,
  parseSafe,
  time,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Platform, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../../ui/Boundary/Boundary'
import {Button} from '../../../../../ui/Button/Button'
import {useModal} from '../../../../../ui/Modal/ModalContext'
import {Space} from '../../../../../ui/Space/Space'
import {NetworkPickerList} from './NetworkPickerList'
import {useStrings} from './strings'

export const ChangeNetworkScreen = () => {
  const {atoms: ta} = useTheme()
  const {networkNoticeShown} = useNetworkNoticeShown()

  const {handleOpenModal} = useHandleOpenNetworkNoticeModal()

  React.useEffect(() => {
    if (!networkNoticeShown) {
      const timeout = setTimeout(handleOpenModal, time.seconds(0.5))

      return () => clearTimeout(timeout)
    }
  }, [handleOpenModal, networkNoticeShown])

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[
        {
          flex: 1,
        },
        ta.bg_color_max,
      ]}
    >
      <Boundary>
        <NetworkPickerList />
      </Boundary>
    </SafeAreaView>
  )
}

export const useHandleOpenNetworkNoticeModal = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {openModal, closeModal} = useModal()
  const {refetch} = useNetworkNoticeShown()
  const {networkNoticeShown} = useNetworkNoticeShown()

  const setNetworkNoticeShown = useSetNetworkNoticeShown({
    onSuccess: () => refetch(),
  })

  const onClose = React.useCallback(() => {
    if (!networkNoticeShown) setNetworkNoticeShown()
  }, [networkNoticeShown, setNetworkNoticeShown])

  const handleOpenModal = () => {
    openModal({
      title: strings.networkNoticeTitle,
      content: (
        <View style={[a.flex_1, a.px_lg]}>
          <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
            {strings.networkNoticeMessage}
          </Text>

          <Space.Height.lg />

          <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
            {strings.networkNoticeListTitle}
          </Text>

          <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
            {strings.networkNoticeList}
          </Text>

          <Space.Height.sm fill />

          {Platform.OS === 'android' && <Space.Height.lg />}
        </View>
      ),
      footer: (
        <Button title={strings.networkNoticeButton} onPress={closeModal} />
      ),
      height: 450,
      onClose,
    })
  }

  return {handleOpenModal}
}

const useSetNetworkNoticeShown = (
  options?: UseMutationOptions<void, Error, void>,
) => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: () =>
      storage.join('appSettings/').setItem('networkNoticeShown', true),
    invalidateQueries: [['useSetShowNetworkNoticeInfo']],
    ...options,
  })

  return mutation.mutate
}

const useNetworkNoticeShown = (
  options?: UseQueryOptions<boolean, Error, boolean>,
) => {
  const storage = useAsyncStorage()

  const query = useQuery({
    suspense: true,
    queryKey: ['useNetworkNoticeShown'],
    ...options,
    queryFn: async () => {
      const result = await storage
        .join('appSettings/')
        .getItem('networkNoticeShown')
      const parsed = parseSafe(result)
      return isBoolean(parsed) ? parsed : false
    },
  })

  return {
    ...query,
    networkNoticeShown: query.data,
  }
}
