describe('runtime utility functions', () => {
  const importRuntime = (
    os: 'ios' | 'android' | 'web' | 'windows' | 'macos',
  ) => {
    jest.resetModules()
    jest.doMock('react-native', () => ({
      Platform: {OS: os},
    }))
    return require('./runtime')
  }

  it('web() returns value only on web', () => {
    let runtime = importRuntime('web')
    expect(runtime.web('test')).toBe('test')

    runtime = importRuntime('ios')
    expect(runtime.web('test')).toBeUndefined()
  })

  it('native() returns value only on native platforms', () => {
    let runtime = importRuntime('ios')
    expect(runtime.native('test')).toBe('test')

    runtime = importRuntime('android')
    expect(runtime.native('test')).toBe('test')

    runtime = importRuntime('web')
    expect(runtime.native('test')).toBeUndefined()
  })

  it('ios() returns value only on iOS', () => {
    let runtime = importRuntime('ios')
    expect(runtime.ios('test')).toBe('test')

    runtime = importRuntime('android')
    expect(runtime.ios('test')).toBeUndefined()

    runtime = importRuntime('web')
    expect(runtime.ios('test')).toBeUndefined()
  })

  it('android() returns value only on Android', () => {
    let runtime = importRuntime('android')
    expect(runtime.android('test')).toBe('test')

    runtime = importRuntime('ios')
    expect(runtime.android('test')).toBeUndefined()

    runtime = importRuntime('web')
    expect(runtime.android('test')).toBeUndefined()
  })
})
