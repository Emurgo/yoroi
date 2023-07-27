import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../../components'
import {BottomSheetModal} from '../../../../../components/BottomSheet'
import {COLORS} from '../../../../../theme'

type ExpandableInfoCardProps = {
  label: string | React.ReactNode | null
  mainInfo: Array<{label: string; value?: string}>
  hiddenInfo: Array<{label: string; value: string; info?: string}>
  navigateTo?: () => void
  buttonAction?: () => void
  buttonText?: string
  withBoxShadow?: boolean
}

export const ExpandableInfoCard = ({
  label,
  mainInfo,
  hiddenInfo,
  navigateTo,
  buttonText,
  buttonAction,
  withBoxShadow,
}: ExpandableInfoCardProps) => {
  const [bottomSheetState, setBottomSheetSate] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })
  const [showHiddenInfo, setShowHiddenInfo] = React.useState(false)

  return (
    <View style={{padding: 5}}>
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

        <View>
          {mainInfo?.map((item, index) => (
            <View key={index}>
              <View style={styles.flexBetween}>
                <Text style={styles.gray}>{`${item.label}`}</Text>

                {item?.value !== undefined && <Text style={styles.text}>{`${item?.value}`}</Text>}
              </View>

              {index !== mainInfo?.length - 1 && <Spacer height={8} />}
            </View>
          ))}
        </View>

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

                      <TouchableOpacity
                        onPress={() => {
                          setBottomSheetSate({
                            isOpen: true,
                            title: item.label,
                            content: item?.info,
                          })
                        }}
                      >
                        <Icon.Info size={24} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.text}>{item.value}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {buttonText != null && (
          <TouchableOpacity style={styles.button} onPress={buttonAction && buttonAction}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Spacer height={16} />

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        content={<Text style={styles.text}>{bottomSheetState.content}</Text>}
        onClose={() => {
          setBottomSheetSate({isOpen: false, title: '', content: ''})
        }}
      />
    </View>
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
    fontSize: 16,
  },
  gray: {
    color: COLORS.GRAY,
  },
  button: {
    width: 111,
  },
  buttonText: {
    fontSize: 14,
    paddingTop: 13,
    fontWeight: '500',
  },
})
