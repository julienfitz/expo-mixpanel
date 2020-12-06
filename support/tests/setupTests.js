jest.mock('expo-constants', () => {
    const Constants = {
      statusBarHeight: 5,
      deviceId: 123
    }

    Constants.manifest = {
      name: 'manifest name',
      slug: 'manifest-name',
      version: 1.0,
      deviceName: 'Bob'
    }

    Constants.platform = {
      ios: {
        platform: 'ios',
        model: 'XS',
        systemVersion: 'who-cares'
      }
    }

    Constants.getWebViewUserAgentAsync = jest.fn()

    return Constants
})
