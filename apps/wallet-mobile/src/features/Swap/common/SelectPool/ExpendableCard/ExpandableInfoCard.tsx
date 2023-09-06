import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Icon, Spacer} from '../../../../../components'
import {BottomSheetModal} from '../../../../../components/BottomSheetModal'
import {COLORS} from '../../../../../theme'

export type ExpandableInfoCardProps = {
  label: string | React.ReactNode | null
  mainInfo: React.ReactNode
  hiddenInfo: Array<{label: string; value: string | React.ReactNode; info?: string}>
  navigateTo?: () => void
  onPress?: () => void
  buttonLabel?: string
  withBoxShadow?: boolean
}

export const ExpandableInfoCard = ({
  label,
  mainInfo,
  hiddenInfo,
  navigateTo,
  buttonLabel,
  onPress,
  withBoxShadow,
}: ExpandableInfoCardProps) => {
  const [bottomSheetState, setBottomSheetState] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })
  const [showHiddenInfo, setShowHiddenInfo] = React.useState(false)

  return (
    <View>
      <View style={[styles.container, withBoxShadow && styles.shadowProp]}>
        <View style={styles.flexBetween}>
          <TouchableOpacity onPress={() => navigateTo?.()}>
            <Text style={[styles.label]}>{label}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowHiddenInfo(!showHiddenInfo)}>
            {showHiddenInfo ? <Icon.Chevron direction="up" size={24} /> : <Icon.Chevron direction="down" size={24} />}
          </TouchableOpacity>
        </View>

        <Spacer height={8} />

        {mainInfo}

        {showHiddenInfo && (
          <View>
            {hiddenInfo.map((item, index) => {
              return (
                <View key={item.label}>
                  <Spacer height={8} />

                  <View key={index} style={styles.flexBetween}>
                    <View style={styles.flex}>
                      <Text style={[styles.text, styles.gray]}>{item.label}</Text>

                      <Spacer width={8} />

                      {item.info !== undefined && (
                        <TouchableOpacity
                          onPress={() => {
                            setBottomSheetState({
                              isOpen: true,
                              title: item.label,
                              content: item.info,
                            })
                          }}
                        >
                          <Icon.Info size={24} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {typeof item.value === 'string' ? <Text style={styles.text}>{item.value}</Text> : item.value}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {buttonLabel != null && (
          <TouchableOpacity style={styles.button} onPress={onPress && onPress}>
            <Text style={styles.buttonLabel}>{buttonLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Spacer height={16} />

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        onClose={() => {
          setBottomSheetState({isOpen: false, title: '', content: ''})
        }}
      >
        <Text style={styles.text}>{bottomSheetState.content}</Text>
      </BottomSheetModal>
    </View>
  )
}

export const MainInfoWrapper = ({label, value, isLast = false}: {label: string; value?: string; isLast?: boolean}) => {
  return (
    <View>
      <View style={styles.flexBetween}>
        <Text style={styles.gray}>{`${label}`}</Text>

        {value !== undefined && <Text style={styles.text}>{`${value}`}</Text>}
      </View>

      {!isLast && <Spacer height={8} />}
    </View>
  )
}

export const ExpandableInfoCardSkeleton = () => {
  return (
    <SkeletonPlaceholder>
      <View style={{height: 160, borderRadius: 8}}></View>
    </SkeletonPlaceholder>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.TEXT_GRAY3,
    padding: 16,
    width: '100%',
    height: 'auto',
  },
  shadowProp: {
    backgroundColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
    borderWidth: 0,
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
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
  gray: {
    color: COLORS.GRAY,
  },
  button: {
    width: 111,
  },
  buttonLabel: {
    fontSize: 14,
    paddingTop: 13,
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
  },
})
