export async function isElementChecked(element: WebdriverIO.Element): Promise<boolean> {
  await driver.setImplicitTimeout(300)
  const result = await element.getAttribute('checked')
  console.log(`Element is checked: ${result}`)

  return result === 'true'
}

export const getAmountFromString = (inputAmount: string): string => {
  return inputAmount.split(':')[1].trim().split(' ')[0]
}

export function getPrettyDate(dateObject: Date = new Date(), dateTimeFormat: string = 'ISO') {
  const options: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'short', day: 'numeric'}
  switch (dateTimeFormat) {
    case 'US':
      return dateObject.toLocaleDateString('en-US', options)
    default:
      // ISO format
      return dateObject.toISOString().split('T')[0]
  }
}

export const amPmTo24 = (inputStringTime) => {
  const [timePart, ampmPart] = inputStringTime.split(' ')
  const [hoursStr, minutes, seconds] = timePart.split(':')
  const hours = parseInt(hoursStr, 10)
  let newHours = ''

  if (ampmPart == 'AM') {
    if (hours == 12) {
      newHours = '00'
    } else {
      newHours = hours < 10 ? `0${hours}` : `${hours}`
    }
  } else if (ampmPart == 'PM' && hours != 12) {
    newHours = (12 + hours).toString()
  }

  return `${newHours}:${minutes}:${seconds}`
}
