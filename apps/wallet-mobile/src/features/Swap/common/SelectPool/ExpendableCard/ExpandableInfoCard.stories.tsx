import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'
import {ExpandableInfoCard, HiddenInfoWrapper, MainInfoWrapper} from './ExpandableInfoCard'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Expandable Info Card', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with inital data', () => {
    const [bottomSheetState, setBottomSheetState] = React.useState<{
      isOpen: boolean
      title: string
      content?: React.ReactNode
    }>({
      isOpen: false,
      title: '',
      content: '',
    })
    const [showHiddenInfo, setShowHiddenInfo] = React.useState(false)

    return (
      <ExpandableInfoCard
        showHiddenInfo={showHiddenInfo}
        setShowHiddenInfo={setShowHiddenInfo}
        bottomSheetState={bottomSheetState}
        setBottomSheetState={setBottomSheetState}
        label="Minswap (Auto)"
        mainInfo={<MainInfo />}
        hiddenInfo={<HiddenInfo setBottomSheetState={setBottomSheetState} />}
      />
    )
  })
  .add('with primary info', () => {
    const [bottomSheetState, setBottomSheetState] = React.useState<{
      isOpen: boolean
      title: string
      content?: React.ReactNode
    }>({
      isOpen: false,
      title: '',
      content: '',
    })
    const [showHiddenInfo, setShowHiddenInfo] = React.useState(false)

    return (
      <ExpandableInfoCard
        showHiddenInfo={showHiddenInfo}
        setShowHiddenInfo={setShowHiddenInfo}
        bottomSheetState={bottomSheetState}
        setBottomSheetState={setBottomSheetState}
        label={
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon.YoroiNightly size={24} />

            <Spacer width={4} />

            <Text>ADA/</Text>

            <Spacer width={4} />

            <Icon.Assets size={24} />

            <Spacer width={4} />

            <Text>USDA</Text>
          </View>
        }
        mainInfo={<MainInfo />}
        hiddenInfo={<HiddenInfo setBottomSheetState={setBottomSheetState} />}
      />
    )
  })
  .add('with primary info and button', () => {
    const [bottomSheetState, setBottomSheetState] = React.useState<{
      isOpen: boolean
      title: string
      content?: React.ReactNode
    }>({
      isOpen: false,
      title: '',
      content: '',
    })
    const [showHiddenInfo, setShowHiddenInfo] = React.useState(false)

    return (
      <ExpandableInfoCard
        showHiddenInfo={showHiddenInfo}
        setShowHiddenInfo={setShowHiddenInfo}
        bottomSheetState={bottomSheetState}
        setBottomSheetState={setBottomSheetState}
        label={
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon.YoroiNightly size={24} />

            <Spacer width={4} />

            <Text>ADA/</Text>

            <Spacer width={4} />

            <Icon.Assets size={24} />

            <Spacer width={4} />

            <Text>USDA</Text>
          </View>
        }
        mainInfo={<MainInfo />}
        hiddenInfo={<HiddenInfo setBottomSheetState={setBottomSheetState} />}
        onPress={() => {
          action('onClose')
        }}
        buttonLabel="CANCEL ORDER"
        withBoxShadow
      />
    )
  })

const HiddenInfo = ({setBottomSheetState}) => {
  return [
    {
      label: 'Min ADA',
      value: '2 ADA',
      info: 'Fake content',
    },
    {
      label: 'Min Received',
      value: '2.99 USDA',
      info: 'Fake content',
    },
    {
      label: 'Fees',
      value: '2 ADA',
      info: 'Fake content',
    },
  ].map((item) => (
    <HiddenInfoWrapper
      key={item.label}
      value={item.value}
      label={item.label}
      onPress={() => {
        setBottomSheetState({
          isOpen: true,
          title: item.label,
          content: item.info,
        })
      }}
    />
  ))
}

const MainInfo = () => {
  return (
    <>
      {[
        {label: 'Token price', value: '3 ADA'},
        {label: 'Token amount', value: '3 USDA'},
      ].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === 1} />
      ))}
    </>
  )
}
