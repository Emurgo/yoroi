export async function isElementChecked(element: WebdriverIO.Element): Promise<boolean> {
  await driver.setImplicitTimeout(300)
  const result = await element.getAttribute('checked')
  console.log(`Element is checked: ${result}`)

  return result === 'true'
}

export const getAmountFromString = (inputAmount: string): string => {
  return inputAmount.split(':')[1].trim().split(' ')[0]
}