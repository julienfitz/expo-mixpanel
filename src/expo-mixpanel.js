/* global fetch */

import { Platform, Dimensions } from 'react-native'
import Constants from 'expo-constants'
import { Buffer } from 'buffer'
import {
  MIXPANEL_API_URL,
  VALID_OPERATIONS
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
   * Sets initial properties.
   *
   * @method init
   * @public
   */
  init = async () => {
    this.clientId = Constants.deviceId
    this.userId = this.clientId
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
    if (this.token && this.ready) {
      this.queue.push({
        name,
        props
      })
      this._flush(operation)
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
  identify = (userId) => {
    if (this.token && this.ready) {
      const data = this._configureEventData({ name: '$identify' })
      this.userId = userId
      this._push(data, 'create-identity', 'track')
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
  reset = () => {
    if (this.token && this.ready) {
      this.identify(this.clientId)
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
    if (this.token && this.ready) {
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
    if (this.token && this.ready) {
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
    while (this.queue.length) {
      const event = this.queue.pop()
      const data = this._configureEventData(event)
      this._push(data, operation, 'track')
      event.sent = true
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

      this._push(data, operation, 'engage')
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

      this._push(data, operation, 'groups')
    } else {
      console.error(`userId not found. ${operation} will not be tracked in Mixpanel.`)
    }
  }

  /**
   * Validates operation and endpoint, then makes request to the Mixpanel API to
   * operate on data.
   *
   * @method _push
   * @param data {Object}
   * @param operation {String}
   * @param endpoint {String}
   * @private
   */
  _push = (data, operation, endpoint) => {
    if (this._operationIsValid(operation, endpoint)) {
      data = Buffer.from(JSON.stringify(data)).toString('base64')
      return fetch(`${MIXPANEL_API_URL}/${endpoint}#${operation}?data=${data}`)
    } else {
      console.error(`'${operation}' is not a valid Mixpanel operation for the ${endpoint} endpoint. This operation will not be tracked.`)
    }
  }

  // VALIDATORS

  /**
   * Looks up the operation in relation to the endpoint to check for validity.
   *
   * @method _operationIsValid
   * @param operation {String}
   * @param endpoint {String}
   * @private
   */
  _operationIsValid = (operation, endpoint) => {
    return VALID_OPERATIONS[endpoint].has(operation)
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
