'use strict'

const Joi = require('joi')
const { InvalidResponse } = require('../errors')
const TeamCityBase = require('./teamcity-base')
const { coveragePercentage } = require('../../lib/color-formatters')

const buildStatisticsSchema = Joi.object({
  property: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .required(),
}).required()

module.exports = class TeamCityCoverage extends TeamCityBase {
  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'coverage',
    }
  }

  static get category() {
    return 'quality'
  }

  static get route() {
    return {
      base: 'teamcity/coverage',
      format: '(?:(http|https)/(.+)/)?([^/]+)',
      capture: ['protocol', 'hostAndPath', 'buildId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'TeamCity Coverage (CodeBetter)',
        pattern: ':buildId',
        namedParams: {
          buildId: 'bt428',
        },
        staticPreview: this.render({
          coverage: 82,
        }),
      },
      {
        title: 'TeamCity Coverage',
        pattern: ':protocol/:hostAndPath/s/:buildId',
        namedParams: {
          protocol: 'https',
          hostAndPath: 'https/teamcity.jetbrains.com',
          buildId: 'bt428',
        },
        staticPreview: this.render({
          coverage: 95,
        }),
      },
    ]
  }

  async handle({ protocol, hostAndPath, buildId }) {
    // JetBrains Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-Statistics
    const buildLocator = `buildType:(id:${buildId})`
    const apiPath = `app/rest/builds/${encodeURIComponent(
      buildLocator
    )}/statistics`
    const data = await this.fetch({
      protocol,
      hostAndPath,
      apiPath,
      schema: buildStatisticsSchema,
    })

    const { coverage } = this.transform({ data })
    return this.constructor.render({ coverage })
  }

  transform({ data }) {
    let covered, total

    for (const p of data.property) {
      if (p.name === 'CodeCoverageAbsSCovered') {
        covered = +p.value
      } else if (p.name === 'CodeCoverageAbsSTotal') {
        total = +p.value
      }

      if (covered !== undefined && total !== undefined) {
        const coverage = covered ? (covered / total) * 100 : 0
        return { coverage }
      }
    }

    throw new InvalidResponse({ prettyMessage: 'no coverage data available' })
  }
}
