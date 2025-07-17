/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineStore } from 'pinia'
import type { CommonState } from '@/store/common/types'

export const useCommonStore = defineStore({
  id: 'common',
  state: (): CommonState => {
    const fromIframe = sessionStorage.getItem('fromIframe') === 'true'
    const hideMenu = sessionStorage.getItem('hideMenu') === 'true'
    // console.log('useCommonStore ~ hideMenu:', hideMenu)
    const token = sessionStorage.getItem('token') || ''
    // console.log('useCommonStore ~ token:', token)

    return {
      fromIframe: fromIframe,
      hideMenu: hideMenu,
      token: token
    }
  },
  // 启用持久化
  // persist: true,
  getters: {},
  actions: {
    setFromIframe(value: boolean): void {
      this.fromIframe = value
      sessionStorage.setItem('fromIframe', String(value))
    },
    setHideMenu(value: boolean): void {
      this.hideMenu = value
      sessionStorage.setItem('hideMenu', String(value))
    },
    setToken(value: string): void {
      this.token = value
      sessionStorage.setItem('token', value)
    }
  }
})
