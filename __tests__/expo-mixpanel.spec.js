/* global fetch */
import ExpoMixpanel from '../src/expo-mixpanel'
import Constants from 'expo-constants'

describe('Mixpanel', () => {
  let mixpanelTracker, store

  const setDefaultConstants = () => {
    Constants.getWebViewUserAgentAsync = jest.fn()
    Constants.deviceId = 123
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
  }

  beforeEach(async () => {
    setDefaultConstants()
    mixpanelTracker = new ExpoMixpanel('random-token-string')
    await mixpanelTracker.init()
  })

  describe('after .init', () => {
    it('defaults the userId to Constants.deviceId', () => {
      expect(mixpanelTracker.userId).toBe(Constants.deviceId)
    })

    describe('.track', () => {
      it('prints an error to the console if an invalid operation is used', async () => {
        const error =
          '\'nonexistent-operation\' is not a valid Mixpanel event tracking operation. This operation will not be tracked.'
        console.error = jest.fn()
        await mixpanelTracker.track('Event Name', { one: 1 }, 'nonexistent-operation')
        expect(console.error).toHaveBeenCalledWith(error)
      })

      it('calls other methods as expected', async () => {
        mixpanelTracker._pushEvent = jest.fn()
        mixpanelTracker._flush = jest.fn()
        await mixpanelTracker.track('Event Name', {}, 'live-event')
        expect(mixpanelTracker._flush).toHaveBeenCalledWith(1, 'live-event')
        expect(mixpanelTracker._pushEvent).toHaveBeenCalledWith('Event Name', 'live-event')
      })
    })

    describe('.identify', () => {
      it('calls _pushEvent with correct arguments', async () => {
        mixpanelTracker._pushEvent = jest.fn()
        await mixpanelTracker.identify(3)
        expect(mixpanelTracker._pushEvent).toHaveBeenCalledWith({ name: '$identify' }, 'create-identity')
      })

      it('correctly sets userId', async () => {
        const newId = 456
        expect(mixpanelTracker.userId).toBe(Constants.deviceId)
        await mixpanelTracker.identify(newId)
        expect(mixpanelTracker.userId).toBe(newId)
      })
    })

    describe('.reset', () => {
      it('calls identify with clientId', async () => {
        mixpanelTracker.identify = jest.fn()
        await mixpanelTracker.reset()
        expect(mixpanelTracker.identify).toHaveBeenCalledWith(Constants.deviceId)
      })

      it('correctly resets userId with Constants.deviceId', async () => {
        const newId = 789
        await mixpanelTracker.identify(newId)
        expect(mixpanelTracker.userId).toBe(newId)
        await mixpanelTracker.reset()
        expect(mixpanelTracker.userId).toBe(Constants.deviceId)
      })
    })

    describe('.people', () => {
      it('throws a console error if userId is not defined', async () => {
        const error = 'userId not found. profile-set will not be tracked in Mixpanel.'
        console.error = jest.fn()
        await mixpanelTracker.identify(null)
        mixpanelTracker.people('profile-set', {})
        expect(console.error).toHaveBeenCalledWith(error)
      })

      it('throws a console error if operation is invalid', async () => {
        const error = '\'invalid-operation\' is not a valid Mixpanel profile operation. This operation will not be tracked.'
        console.error = jest.fn()
        mixpanelTracker.people('invalid-operation', {})
        expect(console.error).toHaveBeenCalledWith(error)
      })

      it('calls _pushProfile', async () => {
        mixpanelTracker._pushProfile = jest.fn()
        mixpanelTracker.people('profile-set', {})
        expect(mixpanelTracker._pushProfile).toHaveBeenCalled()
      })
    })

    describe('.group', () => {
      it('throws a console error if userId is not defined', async () => {
        const error = 'userId not found. group-set will not be tracked in Mixpanel.'
        console.error = jest.fn()
        await mixpanelTracker.identify(null)
        mixpanelTracker.group('group-set', {})
        expect(console.error).toHaveBeenCalledWith(error)
      })

      it('throws a console error if operation is invalid', async () => {
        const error = '\'invalid-operation\' is not a valid Mixpanel group operation. This operation will not be tracked.'
        console.error = jest.fn()
        mixpanelTracker.group('invalid-operation', {})
        expect(console.error).toHaveBeenCalledWith(error)
      })

      it('calls _pushGroup', async () => {
        mixpanelTracker._pushGroup = jest.fn()
        mixpanelTracker.group('group-set', {})
        expect(mixpanelTracker._pushGroup).toHaveBeenCalled()
      })
    })
  })
})
