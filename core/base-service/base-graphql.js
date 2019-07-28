'use strict'

const { print } = require('graphql/language/printer')
const BaseJsonService = require('./base-json')
const { InvalidResponse, ShieldsRuntimeError } = require('./errors')

function defaultTransformErrors(errors) {
  return new InvalidResponse({ prettyMessage: errors[0].message })
}

class BaseGraphqlService extends BaseJsonService {
  async _requestGraphql({
    schema,
    url,
    query,
    variables = {},
    options = {},
    httpErrorMessages = {},
    transformErrors = defaultTransformErrors,
  }) {
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    mergedOptions.method = 'POST'
    mergedOptions.body = JSON.stringify({ query: print(query), variables })
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages: httpErrorMessages,
    })
    const json = this._parseJson(buffer)
    if (json.errors) {
      const exception = transformErrors(json.errors)
      if (exception instanceof ShieldsRuntimeError) {
        throw exception
      } else {
        throw Error(
          `transformErrors() must return a ShieldsRuntimeError; got ${exception}`
        )
      }
    }
    return this.constructor._validate(json, schema)
  }
}

module.exports = BaseGraphqlService
