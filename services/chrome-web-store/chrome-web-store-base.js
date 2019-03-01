'use strict'

const { BaseService } = require('..')
const chromeWebStore = require('chrome-web-store-item-property')
const { checkErrorResponse } = require('../../lib/error-helper')

module.exports = class BaseChromeWebStoreService extends BaseService {
  async fetch({ storeId }) {
    try {
      return await chromeWebStore(storeId)
    } catch (e) {
      /*
      chrome-web-store-item-property's `HTTPError` object has a
      `statusCode` property so we can pass `e` to `checkErrorResponse`
      to throw the correct `ShieldsRuntimeError` for us.
      */
      return checkErrorResponse.asPromise({})({ buffer: '', res: e })
    }
  }
}
