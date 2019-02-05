<template>
<div>
    <md-toolbar class="md-transparent" md-elevation="0">Navigation</md-toolbar>
    <md-list>
        <md-list-item>
            <icon name="view_week" scale="2"></icon>
             <span class="md-list-item-text">
                 <router-link to="/">チケット一覧</router-link>
             </span>
        </md-list-item>			
        <md-list-item>
            <icon name="insert_chart" scale="2"></icon>
            <span class="md-list-item-text">
              <router-link to="/report">振り返り</router-link>
            </span>
        </md-list-item>
        <md-list-item>
            <icon name="move_to_inbox" scale="2"></icon>
            <span class="md-list-item-text">
              <router-link to="/archive">アーカイブ</router-link>
            </span>
        </md-list-item>
    </md-list>
</div>
</template>
<script>
export default {
  name: 'side-bar'
}
</script>
<style>
</style>
