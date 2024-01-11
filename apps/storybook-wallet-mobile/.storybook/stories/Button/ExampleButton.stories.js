import React from 'react';
import { View } from 'react-native';

import { ExampleButton } from './ExampleButton';

const ExampleMeta = {
  title: 'Example Button',
  component: ExampleButton,
  argTypes: {
    onPress: { action: 'pressed the button' },
  },
  args: {
    text: 'Storybook CSF Example',
    disabled: false,
  },
  decorators: [
    (Story) => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default ExampleMeta;

export const Basic = {};

