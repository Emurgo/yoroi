import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../src/components'
import {COLORS} from '../../../../../src/theme'

type SelectPoolCardProps = {
  label: string | null
  mainInfo: {value: string; label: string}
  secondaryInfo: Array<{label: string; value: string}>
}

export const ExpandableInfoCard = ({label, mainInfo, secondaryInfo}: SelectPoolCardProps) => {
  const [showSecondaryInfo, setShowSecondaryInfo] = React.useState(false)

  return (
    <View style={[styles.container]}>
      <View style={styles.flexBetween}>
        <Text style={[styles.label]}>{label}</Text>

        <TouchableOpacity onPress={() => setShowSecondaryInfo(!showSecondaryInfo)}>
          {showSecondaryInfo ? <Icon.Chevron direction="up" size={24} /> : <Icon.Chevron direction="down" size={24} />}
        </TouchableOpacity>
      </View>

      <Spacer height={8} />

      <View>
        <Text style={styles.text}>{`${mainInfo.label} ${mainInfo.value}`}</Text>
      </View>

      {showSecondaryInfo && (
        <View>
          {secondaryInfo.map((item, index) => {
            return (
              <>
                <Spacer height={8} />

                <View key={index} style={styles.flexBetween}>
                  <View style={styles.flex}>
                    <Text style={[styles.text, styles.gray]}>{item.label}</Text>

                    <Spacer width={8} />

                    <Icon.Info size={24} />
                  </View>

                  <Text style={styles.text}>{item.value}</Text>
                </View>
              </>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7AFC0',
    padding: 16,
    width: '100%',
    height: 'auto',
  },
  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: COLORS.SHELLEY_BLUE,
    fontWeight: '500',
    fontSize: 16,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
  gray: {
    color: COLORS.GRAY,
  },
})
