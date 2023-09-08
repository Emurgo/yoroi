import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Spacer} from '../Spacer'
import {ExpandableInfoCard, Footer, HeaderWrapper, HiddenInfoWrapper, MainInfoWrapper} from './ExpandableInfoCard'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Expandable Info Card', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with Box Shadow', () => {
    const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

    const extended = hiddenInfoOpenId === '1234'

    return (
      <ExpandableInfoCard
        adornment={<HiddenInfo id="1234" setBottomSheetState={() => null} />}
        extended={extended}
        header={
          <Header
            assetFromLabel="ADA"
            assetToLabel="DOGE"
            extended={extended}
            onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== '1234' ? '1234' : null)}
          />
        }
        footer={
          <Footer onPress={() => action('footer clicked')}>
            <Text>FOOTER LABEL</Text>
          </Footer>
        }
        withBoxShadow
      >
        <MainInfo />
      </ExpandableInfoCard>
    )
  })
  .add('without Box Shadow', () => {
    const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

    const extended = hiddenInfoOpenId === '1234'

    return (
      <ExpandableInfoCard
        adornment={<HiddenInfo id="1234" setBottomSheetState={() => null} />}
        extended={extended}
        header={
          <Header
            assetFromLabel="ADA"
            assetToLabel="DOGE"
            extended={extended}
            onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== '1234' ? '1234' : null)}
          />
        }
        footer={
          <Footer onPress={() => action('footer clicked')}>
            <Text>FOOTER LABEL</Text>
          </Footer>
        }
      >
        <MainInfo />
      </ExpandableInfoCard>
    )
  })

const Header = ({
  assetFromLabel,
  assetToLabel,
  extended,
  onPress,
}: {
  assetFromLabel: string
  assetToLabel: string
  extended: boolean
  onPress: () => void
}) => {
  return (
    <HeaderWrapper extended={extended} onPress={onPress}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon.YoroiNightly size={24} />

        <Spacer width={4} />

        <Text>{assetFromLabel}</Text>

        <Text>/</Text>

        <Spacer width={4} />

        <Icon.Assets size={24} />

        <Spacer width={4} />

        <Text>{assetToLabel}</Text>
      </View>
    </HeaderWrapper>
  )
}

const HiddenInfo = ({id, setBottomSheetState}) => {
  return (
    <View>
      {[
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
              openId: id,
              title: item.label,
              content: item.info,
            })
          }}
        />
      ))}
    </View>
  )
}

const MainInfo = () => {
  return (
    <View>
      {[
        {label: 'Token price', value: '3 ADA'},
        {label: 'Token amount', value: '3 USDA'},
      ].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === 1} />
      ))}
    </View>
  )
}
