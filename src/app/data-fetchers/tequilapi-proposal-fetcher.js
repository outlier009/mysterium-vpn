/*
 * Copyright (C) 2017 The "mysteriumnetwork/mysterium-vpn" Authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow

import ProposalDTO from 'mysterium-tequilapi/lib/dto/proposal'
import ProposalsQuery from 'mysterium-tequilapi/lib/adapters/proposals-query'
import type { TequilapiClient } from 'mysterium-tequilapi/lib/client'
import { FunctionLooper } from '../../libraries/function-looper'
import type { Subscriber } from '../../libraries/publisher'
import Publisher from '../../libraries/publisher'
import type { ProposalFetcher } from './proposal-fetcher'

const proposalsQueryWithMetric = new ProposalsQuery({ fetchConnectCounts: true })
const filterFailedProposals = (proposal: ProposalDTO) => {
  if (proposal.metrics && proposal.metrics.connectCount) {
    const count = proposal.metrics.connectCount
    if (count.success < 30 && count.fail > 0) {
      return false
    }
  }
  return true
}

class TequilapiProposalFetcher implements ProposalFetcher {
  _api: TequilapiClient
  _loop: FunctionLooper
  _proposalPublisher: Publisher<ProposalDTO[]> = new Publisher()
  _errorPublisher: Publisher<Error> = new Publisher()
  _showMore: boolean = false

  constructor (api: TequilapiClient, interval: number = 5000) {
    this._api = api

    this._loop = new FunctionLooper(async () => {
      await this.fetch(this._showMore)
    }, interval)

    this._loop.onFunctionError((error) => {
      this._errorPublisher.publish(error)
    })
  }

  /**
   * Starts periodic proposal fetching.
   */
  start (): void {
    this._loop.start()
  }

  /**
   * Forces proposals to be fetched without delaying.
   */
  async fetch (showMore: boolean): Promise<ProposalDTO[]> {
    let proposals = await this._api.findProposals(proposalsQueryWithMetric)

    this._showMore = showMore
    if (!showMore) {
      proposals = proposals.filter(filterFailedProposals)
    }

    this._proposalPublisher.publish(proposals)

    return proposals
  }

  async stop (): Promise<void> {
    await this._loop.stop()
  }

  onFetchedProposals (subscriber: Subscriber<ProposalDTO[]>): void {
    this._proposalPublisher.addSubscriber(subscriber)
  }

  onFetchingError (subscriber: Subscriber<Error>): void {
    this._errorPublisher.addSubscriber(subscriber)
  }
}

export default TequilapiProposalFetcher
