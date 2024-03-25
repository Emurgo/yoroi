import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {LabelCategoryDApp} from '../../../common/LabelCategoryDApp'
// import {LabelConnected} from '../../../common/LabelConnected'
import {IDAppItem} from '../DAppMock'

type Props = {
  dApp: IDAppItem
}
export const DAppItem = ({dApp}: Props) => {
  const {styles} = useStyles()

  const [isPressed, setIsPressed] = React.useState(false)

  const handlePress = (isPressIn: boolean) => {
    setIsPressed(isPressIn)
  }

  return (
    <TouchableWithoutFeedback onPressIn={() => handlePress(true)} onPressOut={() => handlePress(false)}>
      <View style={styles.dAppItemContainer}>
        <View>
          <Image source={{uri: Image.resolveAssetSource(dApp.logo).uri}} style={styles.dAppLogo} />
        </View>

        <View style={styles.flexFull}>
          <Text style={styles.nameText}>{dApp.name}</Text>

          {dApp?.description !== undefined && (
            <Text style={[styles.descriptionText, isPressed && styles.descriptionTextActive]}>{dApp.description}</Text>
          )}

          <Spacer height={8} />

          <View style={styles.labelBox}>
            {/* <LabelConnected /> */}

            {dApp.category !== undefined && <LabelCategoryDApp category={dApp.category} />}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    dAppItemContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    nameText: {
      color: color.gray[900],
      fontWeight: '500',
      ...typography['body-1-l-medium'],
    },
    descriptionText: {
      color: color.gray[600],
      ...typography['body-3-s-regular'],
    },
    descriptionTextActive: {
      color: color.gray['max'],
    },
    flexFull: {
      flex: 1,
    },
    labelBox: {
      flexDirection: 'row',
      gap: 8,
    },
    dAppLogo: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
  })

  return {styles} as const
}
