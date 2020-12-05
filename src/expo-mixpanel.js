/* global fetch */

import { Platform, Dimensions } from 'react-native'
import Constants from 'expo-constants'
import { Buffer } from 'buffer'
import {
  MIXPANEL_API_URL,
  VALID_PROFILE_OPERATIONS,
  VALID_GROUP_OPERATIONS,
  VALID_TRACK_OPERATIONS
} from './helpers'

const { width, height } = Dimensions.get('window')

// originally copied from/based on https://github.com/codekadiya/expo-mixpanel-analytics
export default class ExpoMixpanel {
  constructor (token) {
    this.ready = false
    this.queue = []
    this.token = token
    this.userId = null
  }

  /**
   * Sets initial Artemis user, facility, and organization properties in Mixpanel.
   *
   * @method init
   * @public
   */
  init = async () => {
    this.clientId = Constants.deviceId
    const userAgent = await Constants.getWebViewUserAgentAsync()
    this.userAgent = userAgent
    this.appName = Constants.manifest.name
    this.appId = Constants.manifest.slug
    this.appVersion = Constants.manifest.version
    this.screenSize = `${width}x${height}`
    this.deviceName = Constants.deviceName
    if (Platform.OS === 'ios') {
      this.platform = Constants.platform.ios.platform
      this.model = Constants.platform.ios.model
      this.osVersion = Constants.platform.ios.systemVersion
    } else {
      this.platform = 'android'
    }

    this.ready = true
  }

  /**
   * Method through which events are tracked in Mixpanel.
   * https://developer.mixpanel.com/reference/events
   *
   * @method track
   * @param name {String}
   * @param props {Object}
   * @param operation {String}
   * @public
   */
  track = (name, props, operation) => {
    if (this.token) {
      const queueLength = this.queue.push({
        name,
        props
      })
      this._flush(queueLength, operation)
    } else {
      this._fakeMixpanel(`track: ${name}, ${props}`)
    }
  }

  /**
   * Identifies a user with a unique ID to track user activity
   * across devices, tie a user to their events, and create a user profile.
   * https://developer.mixpanel.com/reference/identities#create-identity
   *
   * @method identify
   * @param userId {Number}
   * @public
   */
  identify = async (userId) => {
    if (this.token) {
      this.userId = userId
      this._pushEvent({ name: '$identify' }, 'create-identity')
    } else {
      this._fakeMixpanel(`identify: ${userId}`)
    }
  }

  /**
   * Resets the user's unique ID to the default device ID.
   * https://developer.mixpanel.com/reference/identities#create-identity
   *
   * @method reset
   * @public
   */
  reset = async () => {
    if (this.token) {
      await this.identify(this.clientId)
    } else {
      this._fakeMixpanel(`reset: ${this.clientId}`)
    }
  }

  /**
   * Interface for all user profile operations.
   * https://developer.mixpanel.com/reference/user-profiles
   *
   * @method people
   * @param operation {String}
   * @param props {Object}
   * @public
   */
  people = (operation, props) => {
    if (this.token) {
      this._people(operation, props)
    } else {
      this._fakeMixpanel(`${operation}: ${props}`)
    }
  }

  /**
   * Interface for all group operations.
   * https://developer.mixpanel.com/reference/group-profiles
   *
   * @method group
   * @param operation {String}
   * @param props {Object}
   * @public
   */
  group = (operation, props) => {
    if (this.token) {
      this._group(operation, props)
    } else {
      this._fakeMixpanel(`${operation}: ${props}`)
    }
  }

  // PRIVATE METHODS

  /**
   * A no-op method that logs arguments to the console when Mixpanel is unavailable.
   * This could be because we're developing locally, or because for some reason
   * Mixpanel is not tracking correctly.
   *
   * @method _fakeMixpanel
   * @private
   * @param ...messages {String|Object|Array|Number} any arbitrary amount of any type
   */
  _fakeMixpanel = (...messages) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Not sent to Mixpanel: ', ...messages)
    }
  }

  /**
   * Empties the event queue, tracks the associated events, and
   * marks them as `sent`.
   *
   * @method _flush
   * @param operation {String}
   * @private
   */
  _flush = (operation) => {
    if (this.ready) {
      while (this.queue.length) {
        const event = this.queue.pop()
        this._pushEvent(event, operation)
        event.sent = true
      }
    }
  }

  /**
   * Intermediate method that configures data for user profile interactions
   * before making the request to the Mixpanel API.
   *
   * @method _people
   * @param operation {String}
   * @param props {Object}
   * @private
   */
  _people = (operation, props) => {
    if (this.userId) {
      const data = {
        '$token': this.token,
        '$distinct_id': this.userId,
        ...props
      }

      this._pushProfile(data, operation)
    } else {
      console.error(`userId not found. ${operation} will not be tracked in Mixpanel.`)
    }
  }

  /**
   * Intermediate method that configures data for group interactions
   * before making the request to the Mixpanel API.
   *
   * @method _group
   * @param operation {String}
   * @param props {Object}
   * @private
   */
  _group = (operation, props) => {
    if (this.userId) {
      const data = {
        '$token': this.token,
        '$distinct_id': this.userId,
        ...props
      }

      this._pushGroup(data, operation)
    } else {
      console.error(`userId not found. ${operation} will not be tracked in Mixpanel.`)
    }
  }

  /**
   * Validates operation and makes request to the Mixpanel API to track
   * the event.
   *
   * @method _pushEvent
   * @param event {Object}
   * @param operation {String}
   * @private
   */
  _pushEvent = (event, operation) => {
    if (this._trackOperationIsValid(operation)) {
      let data = this._configureEventData(event)
      data = Buffer.from(JSON.stringify(data)).toString('base64')

      return fetch(`${MIXPANEL_API_URL}/track#${operation}?data=${data}`)
    } else {
      console.error(`'${operation}' is not a valid Mixpanel event tracking operation. This operation will not be tracked.`)
    }
  }

  /**
   * Validates operation and makes request to the Mixpanel API to
   * operate on user profile data.
   *
   * @method _pushProfile
   * @param data {Object}
   * @param operation {String}
   * @private
   */
  _pushProfile = (data, operation) => {
    if (this._profileOperationIsValid(operation)) {
      data = Buffer.from(JSON.stringify(data)).toString('base64')
      return fetch(`${MIXPANEL_API_URL}/engage#${operation}?data=${data}`)
    } else {
      console.error(`'${operation}' is not a valid Mixpanel profile operation. This operation will not be tracked.`)
    }
  }

  /**
   * Validates operation and makes request to the Mixpanel API to
   * operate on group data.
   *
   * @method _pushGroup
   * @param data {Object}
   * @param operation {String}
   * @private
   */
  _pushGroup = (data, operation) => {
    if (this._groupOperationIsValid(operation)) {
      data = Buffer.from(JSON.stringify(data)).toString('base64')
      return fetch(`${MIXPANEL_API_URL}/groups#${operation}?data=${data}`)
    } else {
      console.error(`'${operation}' is not a valid Mixpanel group operation. This operation will not be tracked.`)
    }
  }

  // VALIDATORS

  /**
   * Validates user profile operations.
   *
   * @method _profileOperationIsValid
   * @param operation {String}
   * @returns {Boolean}
   * @private
   */
  _profileOperationIsValid = (operation) => {
    return VALID_PROFILE_OPERATIONS.has(operation)
  }

  /**
   * Validates group operations.
   *
   * @method _groupOperationIsValid
   * @param operation {String}
   * @returns {Boolean}
   * @private
   */
  _groupOperationIsValid = (operation) => {
    return VALID_GROUP_OPERATIONS.has(operation)
  }

  /**
   * Validates event tracking operations.
   *
   * @method _trackOperationIsValid
   * @param operation {String}
   * @returns {Boolean}
   * @private
   */
  _trackOperationIsValid = (operation) => {
    return VALID_TRACK_OPERATIONS.has(operation)
  }

  // DATA CONFIGURATION

  /**
   * Sets up the data object for event tracking.
   *
   * @method _configureEventData
   * @param event {Object}
   * @returns {Object}
   * @private
   */
  _configureEventData = (event) => {
    let data = {
      event: event.name || '',
      properties: event.props || {}
    }
    if (this.userId) {
      data.properties.distinct_id = this.userId
    }

    data.properties.token = this.token
    data.properties.user_agent = this.userAgent
    data.properties.app_name = this.appName
    data.properties.app_id = this.appId
    data.properties.app_version = this.appVersion
    data.properties.screen_size = this.screenSize
    data.properties.client_id = this.clientId
    data.properties.device_name = this.deviceName
    if (this.platform) {
      data.properties.platform = this.platform
    }
    if (this.model) {
      data.properties.model = this.model
    }
    if (this.osVersion) {
      data.properties.os_version = this.osVersion
    }

    return data
  }
}
