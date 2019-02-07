<template>
  <div class="page-container">
    <md-app md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary">
        <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
        <icon name="menu" color="white" scale="2"></icon>
      </md-button>
          <span class="md-title">Time-Tracker</span>
      </md-app-toolbar>
      <md-app-drawer :md-active.sync="menuVisible">
          <side-bar /> 
      </md-app-drawer>
      <md-app-content>
        <md-table v-model="archiveList" md-sort="lastUpdate" md-sort-order="desc" md-card>
          <md-table-toolbar>
            <h1 class="md-title">Tickets</h1>
          </md-table-toolbar>
          
          <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell md-label="ticketName" md-sort-by="name">{{ item.ticketName }}</md-table-cell>
            <md-table-cell md-label="phase" md-sort-by="phase">{{ item.phase }}</md-table-cell>
            <md-table-cell md-label="taskNum" md-sort-by="taskNum">{{ item.taskNum }}</md-table-cell>
            <md-table-cell md-label="lastUpdate" md-sort-by="lastUpdate">{{ item.lastUpdate }}</md-table-cell>
          </md-table-row>
        </md-table>
      </md-app-content>
    </md-app>
  </div> 
</template>
<script>
import SideBar from '@/components/Template/SideBar'
import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'
export default {
  name: 'archive',
  data: () => ({
    archiveDb: new Datastore({
      filename: path.join(remote.app.getPath('userData'), '/archive.js'),
      autoload: true
    }),
    archiveList: null,
    menuVisible: false
  }),
  created: function () {
    this.archiveDb.find({}, (err, docs) => {
      if (err) {
        console.error(err)
      }
      this.archiveList = docs
    })
  },
  components: {
    SideBar
  }
}
</script>
<style>
.md-app {
    max-height: 1200px;
    height: 100vh;
    border: 1px solid rgba(#000, .12);
}
</style>
