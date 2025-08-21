import * as Font from 'expo-font'
import * as React from 'react'

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)
  const [fontError, setFontError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    async function loadFonts() {
      try {
        // Define font mappings
        const fontMappings = {
          'Rubik': require('../../assets/fonts/Rubik-Regular.ttf'),
          'Rubik-Regular': require('../../assets/fonts/Rubik-Regular.ttf'),
          'Rubik-Medium': require('../../assets/fonts/Rubik-Medium.ttf'),
          'Rubik-Bold': require('../../assets/fonts/Rubik-Bold.ttf'),
          'Rubik-Light': require('../../assets/fonts/Rubik-Light.ttf'),
          'Rubik-SemiBold': require('../../assets/fonts/Rubik-SemiBold.ttf'),
          'Rubik-Black': require('../../assets/fonts/Rubik-Black.ttf'),
          'Rubik-ExtraBold': require('../../assets/fonts/Rubik-ExtraBold.ttf'),
          'Rubik-Italic': require('../../assets/fonts/Rubik-Italic.ttf'),
          'Rubik-MediumItalic': require('../../assets/fonts/Rubik-MediumItalic.ttf'),
          'Rubik-BoldItalic': require('../../assets/fonts/Rubik-BoldItalic.ttf'),
          'Rubik-LightItalic': require('../../assets/fonts/Rubik-LightItalic.ttf'),
          'Rubik-SemiBoldItalic': require('../../assets/fonts/Rubik-SemiBoldItalic.ttf'),
          'Rubik-BlackItalic': require('../../assets/fonts/Rubik-BlackItalic.ttf'),
          'Rubik-ExtraBoldItalic': require('../../assets/fonts/Rubik-ExtraBoldItalic.ttf'),
        }

        // Load fonts individually to better handle failures
        const fontPromises = Object.entries(fontMappings).map(([family, asset]) =>
          Font.loadAsync({ [family]: asset }).catch((error) => {
            console.warn(`Failed to load font ${family}:`, error)
            return null // Return null for failed fonts
          })
        )

        // Wait for all fonts to load, but don't fail if some fonts fail
        await Promise.allSettled(fontPromises)
        setFontsLoaded(true)
      } catch (error) {
        console.warn('Font loading failed:', error)
        // Continue without custom fonts - fallback to system fonts
        setFontsLoaded(true)
        setFontError(error as Error)
      }
    }

    loadFonts()
  }, [])

  return { fontsLoaded, fontError }
}
