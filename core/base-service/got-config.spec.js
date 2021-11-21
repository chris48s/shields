import { expect } from 'chai'
import { _getUserAgent } from './got-config.js'

describe('_getUserAgent function', function () {
  afterEach(function () {
    delete process.env.HEROKU_SLUG_COMMIT
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
})
