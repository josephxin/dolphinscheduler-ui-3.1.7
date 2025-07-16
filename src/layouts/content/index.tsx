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

import { defineComponent, onMounted, watch, toRefs, ref } from 'vue'
import { NLayout, NLayoutContent, NLayoutHeader, useMessage } from 'naive-ui'
import NavBar from './components/navbar'
import SideBar from './components/sidebar'
import { useDataList } from './use-dataList'
import { useLocalesStore } from '@/store/locales/locales'
import { useRouteStore } from '@/store/route/route'
import { useUserStore } from '@/store/user/user'
import { useCommonStore } from '@/store/common/common'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getUserInfo } from '@/service/modules/users'
import { UserInfoRes } from '@/service/modules/users/types'

const Content = defineComponent({
  name: 'DSContent',
  setup() {
    window.$message = useMessage()

    const route = useRoute()
    const { locale } = useI18n()
    const localesStore = useLocalesStore()
    const routeStore = useRouteStore()
    const userStore = useUserStore()
    const commonStore = useCommonStore()

    const {
      state,
      changeMenuOption,
      changeHeaderMenuOptions,
      changeUserDropdown
    } = useDataList()

    const sideKeyRef = ref()
    const hideMenuRef = ref(false)

    onMounted(() => {
      locale.value = localesStore.getLocales
      getUrlSearch()
      fetchUserInfo()
      changeMenuOption(state)
      changeHeaderMenuOptions(state)
      getSideMenu(state)
      changeUserDropdown(state)
    })

    const getUrlSearch = () => {
      // console.log('route', route)
      const { fromIframe, hideMenu } = route.query
      commonStore.setFromIframe(fromIframe === 'true')
      commonStore.setHideMenu(hideMenu === 'true')
      hideMenuRef.value = hideMenu === 'true'
    }

    const fetchUserInfo = async () => {
      const userInfo = userStore.userInfo as UserInfoRes
      // console.log('fetchUserInfo -> userInfo', userInfo)
      if (!userInfo?.userName) {
        const userInfoRes: UserInfoRes = await getUserInfo()
        await userStore.setUserInfo(userInfoRes)
      }
    }

    const getSideMenu = (state: any) => {
      const key = route.meta.activeMenu
      state.sideMenuOptions =
        state.menuOptions.filter((menu: { key: string }) => menu.key === key)[0]
          ?.children || state.menuOptions
      state.isShowSide = route.meta.showSide
    }

    watch(useI18n().locale, () => {
      changeMenuOption(state)
      changeHeaderMenuOptions(state)
      getSideMenu(state)
      changeUserDropdown(state)
    })

    watch(
      () => route.path,
      () => {
        // console.log('🚀 ~ setup ~ route:', route)
        if (route.path !== '/login') {
          routeStore.setLastRoute(route.path)

          state.isShowSide = route.meta.showSide as boolean
          // 把项目编码加上
          if (route.matched[1].path === '/projects/:projectCode') {
            changeMenuOption(state)
          }

          getSideMenu(state)

          const currentSide = (
            route.meta.activeSide
              ? route.meta.activeSide
              : route.matched[1].path
          ) as string
          sideKeyRef.value = currentSide.includes(':projectCode')
            ? currentSide.replace(
                ':projectCode',
                route.params.projectCode as string
              )
            : currentSide
        }
      },
      { immediate: true }
    )

    return {
      // toRefs 是 Vue3 组合式 API 中处理响应式对象解构的重要工具，它使得我们可以安全地解构响应式对象而不丢失响应性
      // 只能用于 reactive 创建的对象，这样模板可以直接使用state中的属性，而不失去响应性
      ...toRefs(state),
      changeMenuOption,
      sideKeyRef,
      hideMenuRef
    }
  },
  render() {
    // console.log('this.hideMenuRef', this.hideMenuRef)
    return (
      <NLayout style='height: 100%'>
        {!this.hideMenuRef && (
          <NLayoutHeader style='height: 65px'>
            <NavBar
              class='tab-horizontal'
              headerMenuOptions={this.headerMenuOptions}
              localesOptions={this.localesOptions}
              timezoneOptions={this.timezoneOptions}
              userDropdownOptions={this.userDropdownOptions}
            />
          </NLayoutHeader>
        )}

        <NLayout
          has-sider
          position='absolute'
          style={{ top: this.hideMenuRef ? '' : '65px' }}
        >
          {this.isShowSide && (
            <SideBar
              sideMenuOptions={this.sideMenuOptions}
              sideKey={this.sideKeyRef}
            />
          )}
          <NLayoutContent
            native-scrollbar={false}
            style='padding: 16px 22px'
            contentStyle={'height: 100%'}
          >
            <router-view key={this.$route.fullPath} />
          </NLayoutContent>
        </NLayout>
      </NLayout>
    )
  }
})

export default Content
