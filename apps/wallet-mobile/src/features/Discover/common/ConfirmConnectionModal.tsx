import * as React from 'react'
import {View, Text, Image, StyleSheet} from 'react-native'
import {Button, Icon, Spacer, useModal} from '../../../components'
import {useTheme} from '@yoroi/theme'
import {useStrings} from './useStrings'

type Props = {
  name: string
  website: string
  logo: string
  onConfirm: () => void
}

export const confirmConnectionModalHeight = 400

export const useOpenConfirmConnectionModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const open = React.useCallback((props: Props & {onClose: () => void}) => {
    openModal(
      strings.confirmConnectionModalTitle,
      <ConfirmConnectionModal
        name={props.name}
        website={props.website}
        logo={props.logo}
        onConfirm={() => {
          props.onConfirm()
          closeModal()
        }}
      />,
      confirmConnectionModalHeight,
      props.onClose,
    )
  }, [])
  return {openConfirmConnectionModal: open, closeModal}
}

export const ConfirmConnectionModal = ({name, website, onConfirm, logo}: Props) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <View>
      <View style={styles.imagesLine}>
        <Icon.YoroiApp size={48} />
        <Icon.Connection size={20} color={colors.connection} />
        <Image source={{uri: logo}} style={styles.image} />
      </View>
      <Spacer height={8} />

      <View style={styles.line}>
        <Text style={styles.text}>{strings.confirmConnectionModalConnectTo}</Text>
        <Text style={styles.bold}>{name}</Text>
      </View>
      <Spacer height={8} />
      <View style={styles.line}>
        <Text style={styles.text}>{website}</Text>
      </View>
      <Spacer height={16} />

      <View>
        <Text style={styles.text}>{strings.confirmConnectionModalAllowThisDAppTo}</Text>
        <Text style={styles.text}>{`\u2022 ${strings.confirmConnectionModalPermission1}`}</Text>
        <Text style={styles.text}>{`\u2022 ${strings.confirmConnectionModalPermission2}`}</Text>
      </View>
      <Spacer height={46} />
      <Button title={strings.confirmConnectionModalConnect} shelleyTheme onPress={onConfirm} />
    </View>
  )
}

const useStyles = () => {
  const theme = useTheme()
  const colors = {connection: theme.color.black_static}
  const styles = StyleSheet.create({
    imagesLine: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    },
    image: {
      width: 48,
      height: 48,
    },
    line: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    text: {
      color: theme.color.gray_c900,
      fontSize: 16,
      lineHeight: 24,
    },
    bold: {
      fontWeight: 'bold',
      color: theme.color.gray_c900,
      fontSize: 16,
      lineHeight: 24,
    },
  })
  return {styles, colors}
}
