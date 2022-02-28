import React from 'react'
import {LayoutAnimation, View, ViewProps} from 'react-native'

export const CollapsibleHeader = ({expanded, children}: {expanded: boolean} & ViewProps) => {
  const [_expanded, setExpanded] = React.useState(expanded)

  React.useLayoutEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    setExpanded(expanded)
  }, [expanded])

  return _expanded ? (
    <View style={{overflow: 'hidden'}}>
      <View style={!expanded && {position: 'absolute', width: '100%'}}>{children}</View>
    </View>
  ) : null
}
