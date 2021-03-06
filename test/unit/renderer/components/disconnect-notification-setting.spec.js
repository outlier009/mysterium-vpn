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

import { createLocalVue, mount } from '@vue/test-utils'
import DIContainer from '../../../../src/app/di/vue-container'
import FakeMessageBus from '../../../helpers/fake-message-bus'
import DisconnectNotificationSetting from '@/components/disconnect-notification-setting'
import { afterEach, beforeEach } from '../../../helpers/dependencies'
import messages from '../../../../src/app/communication/messages'
import { UserSettingsProxy } from '../../../../src/app/user-settings/user-settings-proxy'
import { buildRendererCommunication } from '../../../../src/app/communication/renderer-communication'

// TODO: extract this out to DRY with other occurances
function mountWith (communication) {
  const vue = createLocalVue()

  const dependencies = new DIContainer(vue)
  dependencies.constant('rendererCommunication', communication)
  const userSettingsProxy = new UserSettingsProxy(communication)
  userSettingsProxy.startListening()
  dependencies.constant('userSettingsStore', userSettingsProxy)

  return mount(DisconnectNotificationSetting, {
    localVue: vue
  })
}

describe('DisconnectNotificationSetting', () => {
  let fakeMessageBus
  let communication, wrapper

  beforeEach(() => {
    fakeMessageBus = new FakeMessageBus()
    communication = buildRendererCommunication(fakeMessageBus)
    wrapper = mountWith(communication)
  })

  afterEach(() => wrapper.destroy())

  it('sends userSettingsRequest on mounted', () => {
    expect(fakeMessageBus.lastChannel).to.eql(messages.USER_SETTINGS_REQUEST)
  })

  describe('.toggle()', () => {
    it('sends disconnectNotification update via communication channel', () => {
      wrapper.vm.toggle()
      expect(wrapper.vm.isDisconnectNotificationEnabled).to.be.false
      expect(fakeMessageBus.lastChannel).to.eql(messages.SHOW_DISCONNECT_NOTIFICATION)
      expect(fakeMessageBus.lastData).to.be.false
    })
  })

  describe('.updateNotificationSetting()', () => {
    it('updates setting', () => {
      expect(wrapper.vm.isDisconnectNotificationEnabled).to.be.true
      wrapper.vm.updateNotificationSetting(false)
      expect(wrapper.vm.isDisconnectNotificationEnabled).to.be.false
    })
  })
})
