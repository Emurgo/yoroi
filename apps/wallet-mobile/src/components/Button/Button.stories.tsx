import {storiesOf} from '@storybook/react-native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Accordion} from '../Accordion/Accordion'
import {Icon} from '../Icon'
import {Button, ButtonType} from './Button'

storiesOf('Button', module).add('default', () => {
  const {color, isDark, selectThemeName} = useTheme()
  const [expanded, setExpanded] = React.useState<ButtonType | null>(ButtonType.Primary)

  return (
    <ScrollView style={{backgroundColor: color.bg_color_max, padding: 16}}>
      <Grid>
        <Button
          onPress={() => {
            selectThemeName(isDark ? 'default-light' : 'default-dark')
          }}
          icon={Icon.Theme}
        />

        <View style={{flexDirection: 'row', gap: 16, paddingVertical: 16}}>
          <Button type={ButtonType.Secondary} title="Cancel" />

          <Button title="Continue" icon={Icon.Bluetooth} />
        </View>
      </Grid>

      <Accordion
        label={ButtonType.Primary}
        expanded={expanded === ButtonType.Primary}
        onChange={() => setExpanded(expanded === ButtonType.Primary ? null : ButtonType.Primary)}
      >
        <Grid>
          <Button title="Button" />

          <Button title="Button" isLoading />

          <Button title="Button" disabled />
        </Grid>

        <Grid>
          <Button title="Button" icon={Icon.Clock} />

          <Button title="Button" icon={Icon.Clock} disabled />
        </Grid>

        <Grid>
          <Button title="Button" size="S" />

          <Button title="Button" size="S" isLoading />

          <Button title="Button" size="S" disabled />
        </Grid>

        <Grid>
          <Button title="Button" size="S" icon={Icon.Clock} />

          <Button title="Button" size="S" icon={Icon.Clock} disabled />
        </Grid>
      </Accordion>

      <Accordion
        label={ButtonType.Secondary}
        expanded={expanded === ButtonType.Secondary}
        onChange={() => setExpanded(expanded === ButtonType.Secondary ? null : ButtonType.Secondary)}
      >
        <Grid>
          <Button title="Button" type={ButtonType.Secondary} />

          <Button title="Button" type={ButtonType.Secondary} isLoading />

          <Button title="Button" type={ButtonType.Secondary} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Secondary} icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.Secondary} icon={Icon.Clock} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Secondary} size="S" />

          <Button title="Button" type={ButtonType.Secondary} size="S" isLoading />

          <Button title="Button" type={ButtonType.Secondary} size="S" disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Secondary} size="S" icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.Secondary} size="S" icon={Icon.Clock} disabled />
        </Grid>
      </Accordion>

      <Accordion
        label={ButtonType.Critical}
        expanded={expanded === ButtonType.Critical}
        onChange={() => setExpanded(expanded === ButtonType.Critical ? null : ButtonType.Critical)}
      >
        <Grid>
          <Button title="Button" type={ButtonType.Critical} />

          <Button title="Button" type={ButtonType.Critical} isLoading />

          <Button title="Button" type={ButtonType.Critical} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Critical} icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.Critical} icon={Icon.Clock} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Critical} size="S" />

          <Button title="Button" type={ButtonType.Critical} size="S" isLoading />

          <Button title="Button" type={ButtonType.Critical} size="S" disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Critical} size="S" icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.Critical} size="S" icon={Icon.Clock} disabled />
        </Grid>
      </Accordion>

      <Accordion
        label={ButtonType.Text}
        expanded={expanded === ButtonType.Text}
        onChange={() => setExpanded(expanded === ButtonType.Text ? null : ButtonType.Text)}
      >
        <Grid>
          <Button title="Button" type={ButtonType.Text} />

          <Button title="Button" type={ButtonType.Text} isLoading />

          <Button title="Button" type={ButtonType.Text} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Text} icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.Text} icon={Icon.Clock} rightIcon />

          <Button title="Button" type={ButtonType.Text} icon={Icon.Clock} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Text} size="S" />

          <Button title="Button" type={ButtonType.Text} size="S" isLoading />

          <Button title="Button" type={ButtonType.Text} size="S" disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Text} size="S" icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.Text} size="S" icon={Icon.Clock} rightIcon />

          <Button title="Button" type={ButtonType.Text} size="S" icon={Icon.Clock} disabled />
        </Grid>
      </Accordion>

      <Accordion
        label={ButtonType.SecondaryText}
        expanded={expanded === ButtonType.SecondaryText}
        onChange={() => setExpanded(expanded === ButtonType.SecondaryText ? null : ButtonType.SecondaryText)}
      >
        <Grid>
          <Button title="Button" type={ButtonType.SecondaryText} />

          <Button title="Button" type={ButtonType.SecondaryText} isLoading />

          <Button title="Button" type={ButtonType.SecondaryText} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.SecondaryText} icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.SecondaryText} icon={Icon.Clock} rightIcon />

          <Button title="Button" type={ButtonType.SecondaryText} icon={Icon.Clock} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.SecondaryText} size="S" />

          <Button title="Button" type={ButtonType.SecondaryText} size="S" isLoading />

          <Button title="Button" type={ButtonType.SecondaryText} size="S" disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.SecondaryText} size="S" icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.SecondaryText} size="S" icon={Icon.Clock} rightIcon />

          <Button title="Button" type={ButtonType.SecondaryText} size="S" icon={Icon.Clock} disabled />
        </Grid>
      </Accordion>

      <Accordion
        label={ButtonType.Circle}
        expanded={expanded === ButtonType.Circle}
        onChange={() => setExpanded(expanded === ButtonType.Circle ? null : ButtonType.Circle)}
      >
        <Grid>
          <Button title="Button" type={ButtonType.Circle} icon={Icon.Clock} />

          <Button title="Button" type={ButtonType.Circle} icon={Icon.Clock} disabled />
        </Grid>
      </Accordion>

      <Accordion
        label={ButtonType.Link}
        expanded={expanded === ButtonType.Link}
        onChange={() => setExpanded(expanded === ButtonType.Link ? null : ButtonType.Link)}
      >
        <Grid>
          <Button title="Button" type={ButtonType.Link} />

          <Button title="Button" type={ButtonType.Link} disabled />
        </Grid>

        <Grid>
          <Button title="Button" type={ButtonType.Link} size="S" />

          <Button title="Button" type={ButtonType.Link} size="S" disabled />
        </Grid>
      </Accordion>
    </ScrollView>
  )
})

const Grid = (props: ViewProps) => <View {...props} style={styles.grid} />

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
})
