export const resolverModuleMaker = (
  strategy: 'all' | 'first',
  receiver: string,
) => {
  const getCryptoAddress = () => {
    if (strategy === 'all') {
      return Promise.all([])
    }

    return Promise.race([])
  }

  return {
    getCryptoAddress,
  }
}
