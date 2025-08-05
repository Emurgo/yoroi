import * as Haptics from 'expo-haptics'

export const success = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

export const error = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

export const warning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
}

export const light = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

export const medium = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

export const heavy = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
}
