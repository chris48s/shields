import { expect } from 'chai'
import { _getUserAgent } from './got-config.js'

describe('_getUserAgent function', function () {
  afterEach(function () {
    delete process.env.HEROKU_SLUG_COMMIT
    delete process.env.DOCKER_SHIELDS_VERSION
  })

  it('uses the default userAgentBase', function () {
    expect(_getUserAgent()).to.equal('shields (self-hosted)/dev')
  })

  it('applies custom userAgentBase', function () {
    expect(_getUserAgent('custom')).to.equal('custom/dev')
  })

  it('uses short commit SHA from HEROKU_SLUG_COMMIT if available', function () {
    process.env.HEROKU_SLUG_COMMIT = '92090bd44742a5fac03bcb117002088fc7485834'
    expect(_getUserAgent('custom')).to.equal('custom/92090bd')
  })

  it('uses short commit SHA from DOCKER_SHIELDS_VERSION if available', function () {
    process.env.DOCKER_SHIELDS_VERSION = 'server-2021-11-22'
    expect(_getUserAgent('custom')).to.equal('custom/server-2021-11-22')
  })
})
