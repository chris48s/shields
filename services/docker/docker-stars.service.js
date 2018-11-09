'use strict'

const BaseService = require('../base')
const { metric } = require('../../lib/text-formatters')
const { InvalidResponse } = require('../errors')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')

module.exports = class DockerStars extends BaseService {
  async fetch({ user, repo }) {
    const url = `https://hub.docker.com/v2/repositories/${user}/${repo}/stars/count/`
    const { buffer } = await this._request({
      url,
      errorMessages: { 404: 'repo not found' },
    })
    const num = parseInt(buffer.toString(), 10)
    if (Number.isNaN(num)) {
      throw new InvalidResponse('Unexpected response.')
    }
    return num
  }

  static render({ stars }) {
    return {
      message: metric(stars),
      color: dockerBlue,
    }
  }

  async handle({ user, repo }) {
    const stars = await this.fetch({ user: getDockerHubUser(user), repo })
    return this.constructor.render({ stars })
  }

  static get defaultBadgeData() {
    return { label: 'docker stars' }
  }

  static get category() {
    return 'rating'
  }

  static get route() {
    return buildDockerUrl('stars')
  }

  static get examples() {
    return [
      {
        title: 'Docker Stars',
        exampleUrl: '_/ubuntu',
        urlPattern: ':user/:repo',
        keywords: ['docker', 'stars'],
        staticExample: this.render({ stars: 9000 }),
      },
    ]
  }
}
