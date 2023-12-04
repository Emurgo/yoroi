export const getCnsCryptoAddress = async (receiverDomain: string) => {
  if (receiverDomain === 'javibueno.blockchain') {
    return Promise.resolve(
      'addr1qyqfm55lklr3lfyay8vqven832mkkatc0v92che77gumghwnqchnr3xqmw9500vq2d9v5v28lau829nknmrj39paed9sc3x34h',
    )
  }

  return Promise.reject(new Error('fake-error'))
}
