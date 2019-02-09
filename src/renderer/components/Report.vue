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
        <md-button class="md-primary" @click="report">レポート出力</md-button>
        <md-tabs v-if="hasData" md-alignment="right">
        <md-tab id="ticketName" md-label="チケット別">
          <GChart
            type="ColumnChart"
            :data="chartData"
            :options="chartOptions"
          />
        </md-tab>
        <md-tab id="phase" md-label="タグ別">
           <GChart
            type="ColumnChart"
            :data="phaseData"
            :options="chartOptions"
          />
        </md-tab>
        </md-tabs>
        <md-empty-state v-else
            md-rounded
            md-label="表示するデータがありません"
            md-description="まずはチケットを作成して、タスク管理をしましょう。">
            <md-avatar class="mim"><img src="static/task.png" alt="Avatar"></md-avatar>
          </md-empty-state>
        <md-button class="md-icon-button left" @click="lastWeek">
          <icon name="keyboard_arrow_left" scale="2"></icon>
        </md-button>
        <md-button class="md-icon-button right" @click="nextWeek">
          <icon name="keyboard_arrow_right" scale="2" v-if="buttonDisabled"></icon>
        </md-button>
        <md-table v-model="ticketData" md-sort="parentName" md-sort-order="asc">
          <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell md-label="ticketName" md-sort-by="parentName">{{ item.parentName }}</md-table-cell>
            <md-table-cell md-label="tag" md-sort-by="tag">{{ item.phase }}</md-table-cell>
            <md-table-cell md-label="taskName" md-sort-by="taskName">{{ item.taskName }}</md-table-cell>
            <md-table-cell md-label="plan">{{ formatPlan(item.taskPlan) }}</md-table-cell>
            <md-table-cell md-label="actual">{{ item.taskActual }}</md-table-cell>
            <md-table-cell md-label="diff">{{ getDiff(item) }}</md-table-cell>
          </md-table-row>
        </md-table>
      </md-app-content>
    </md-app>
  </div>
</template>
<script>
import SideBar from '@/components/Template/SideBar'
import Datastore from 'nedb'
import { GChart } from 'vue-google-charts'
import path from 'path'
import { remote } from 'electron'
export default {
  name: 'report',
  data: () => ({
    menuVisible: false,
    db: new Datastore({
      filename: path.join(remote.app.getPath('userData'), '/data.js'),
      autoload: true
    }),
    taskDb: new Datastore({
      filename: path.join(remote.app.getPath('userData'), '/task.js'),
      autoload: true
    }),
    chartData: null,
    chartOptions: {
      title: '1週間の振り返り'
    },
    ticketData: null,
    hasData: true,
    date: new Date(),
    week: 0,
    buttonDisabled: false,
    sort: null
  }),
  created: function () {
    this.week = 0
    const d = this.date
    const date = d.getDate()
    const w = d.getDay()
    const compareDate = d.setDate(date - w)
    this.db.find({ lastUpdate: { $gt: compareDate } }, { phase: 0, startDate: 0, dueDate: 0, taskNum: 0, done: 0, progress: 0, _id: 0, lastUpdate: 0, delay: 0 }, (err, docs) => {
      if (err) {
        console.error(err)
      }
      let list = [['チケット名', '予定工数', '実工数']]
      if (docs.length === 0) {
        this.hasData = false
      } else {
        this.hasData = true
      }
      for (let i of docs) {
        let tmpList = Object.values(i)
        tmpList[1] = parseFloat(tmpList[1]) * 60
        tmpList[2] = parseInt(tmpList[2].split(':')[0]) * 60 + parseInt(tmpList[2].split(':')[1])
        list.push(tmpList)
      }
      this.chartData = list
    })
    this.taskDb.find({ lastUpdate: { $gt: compareDate } }, (err, docs) => {
      if (err) {
        console.error(err)
      }
      this.ticketData = docs
    })
    const phaseSet = new Set()
    this.db.find({ lastUpdate: { $gt: compareDate } }, { phase: 1, _id: 0 }, (err, docs) => {
      if (err) {
        console.error(err)
      }
      let tmpList = [['チケット名', '予定工数', '実工数']]
      for (let d of docs) {
        phaseSet.add(d.phase)
      }
      for (let item of phaseSet) {
        this.taskDb.find({ phase: item }, (err, docs) => {
          if (err) {
            console.error(err)
          }
          let tmpActual = 0
          let tmpPlan = 0
          let tmpPhase = ''
          for (let data of docs) {
            tmpActual += parseInt(data.taskActual.split(':')[0]) * 60 + parseInt(data.taskActual.split(':')[1])
            tmpPlan += parseFloat(data.taskPlan) * 60
            tmpPhase = data.phase
          }
          tmpList.push([tmpPhase, tmpPlan, tmpActual])
        })
      }
      console.log(tmpList)
      this.phaseData = tmpList
    })
    this.date = new Date()
  },
  computed: {
    formatPlan: function () {
      return function (plan) {
        let h = Math.floor(plan)
        let m
        let list = String(plan).split('.')
        if (list.length > 1) {
          m = parseFloat('0.' + String(plan).split('.')[1])
          m = m * 60
          m = ('0' + m).slice(-2)
        } else {
          m = '00'
        }
        const formatedPlan = h + ':' + m + ':00'
        return formatedPlan
      }
    },
    getDiff: function () {
      return function (item) {
        let diff
        const planH = Math.floor(item.taskPlan)
        let planM
        const list = String(item.taskPlan).split('.')
        if (list.length > 1) {
          planM = parseFloat('0.' + list[1])
          planM = planM * 60
          planM += planH * 60
        } else {
          planM = planH * 60
        }
        const actualList = item.taskActual.split(':')
        const actualH = parseInt(actualList[0])
        let actualM = parseInt(actualList[1])
        actualM += actualH * 60
        const s = ':00'
        let h = 0
        let m = 0
        m = actualM - planM
        if (m >= 60) {
          h = Math.floor(m / 60)
          m -= 60 * h
          diff = h + ':' + m + s
        } else if (m <= -60) {
          h = Math.floor((-1 * m) / 60)
          m += h * 60
          h *= -1
          m *= -1
          diff = h + ':' + m + s
        } else {
          diff = m + s
        }
        return diff
      }
    }
  },
  components: {
    SideBar,
    GChart
  },
  methods: {
    lastWeek: function () {
      this.week -= 1
      const d = this.date
      const date = d.getDate()
      const w = d.getDay()
      const compareDate = d.setDate(date - w + 7 * this.week)
      const lastW = d.setDate(date - w + 7 * this.week + 37 + 1)
      this.db.find({ $and: [ { lastUpdate: { $gt: compareDate } }, { lastUpdate: { $lt: lastW } } ] }, { phase: 0, startDate: 0, dueDate: 0, taskNum: 0, done: 0, progress: 0, _id: 0, lastUpdate: 0, delay: 0 }, (err, docs) => {
        if (err) {
          console.error(err)
        }
        let list = [['予実グラフ', '予定工数', '実工数']]
        if (docs.length === 0) {
          const vacantList = [0, 0, 0]
          list = list.push(vacantList)
          this.cartDate = list
          this.hasData = false
        } else {
          this.hasData = true
          for (let i of docs) {
            let tmpList = Object.values(i)
            tmpList[1] = parseFloat(tmpList[1]) * 60
            tmpList[2] = parseInt(tmpList[2].split(':')[0]) * 60 + parseInt(tmpList[2].split(':')[1])
            list.push(tmpList)
          }
          this.chartData = list
        }
      })
      this.taskDb.find({ $and: [ { lastUpdate: { $gt: compareDate } }, { lastUpdate: { $lt: lastW } } ] }, (err, docs) => {
        if (err) {
          console.error(err)
        }
        this.ticketData = docs
      })
      if (this.week !== 0) {
        this.buttonDisabled = true
      } else {
        this.buttonDisabled = false
      }
      this.date = new Date()
    },
    nextWeek: function () {
      this.week += 1
      const d = this.date
      const date = d.getDate()
      const w = d.getDay()
      const compareDate = d.setDate(date - w + 7 * this.week)
      const nextW = d.setDate(date - w + (7 * this.week) + 36)
      this.db.find({ $and: [ { lastUpdate: { $gt: compareDate } }, { lastUpdate: { $lt: nextW } } ] }, { phase: 0, startDate: 0, dueDate: 0, taskNum: 0, done: 0, progress: 0, _id: 0, lastUpdate: 0, delay: 0 }, (err, docs) => {
        if (err) {
          console.error(err)
        }
        let list = [['予実グラフ', '予定工数', '実工数']]
        if (docs.length === 0) {
          const vacantList = [0, 0, 0]
          list = list.push(vacantList)
          this.cartDate = list
          this.hasData = false
        } else {
          this.hasData = true
          for (let i of docs) {
            let tmpList = Object.values(i)
            tmpList[1] = parseFloat(tmpList[1]) * 60
            tmpList[2] = parseInt(tmpList[2].split(':')[0]) * 60 + parseInt(tmpList[2].split(':')[1])
            list.push(tmpList)
          }
          this.chartData = list
        }
      })
      this.taskDb.find({ $and: [ { lastUpdate: { $gt: compareDate } }, { lastUpdate: { $lt: nextW } } ] }, (err, docs) => {
        if (err) {
          console.error(err)
        }
        this.ticketData = docs
      })
      if (this.week !== 0) {
        this.buttonDisabled = true
      } else {
        this.buttonDisabled = false
      }
      this.date = new Date()
    },
    report: function () {
      let data
      let blob
      data = '# 今週のタスク\n'
      const d = this.date
      const month = d.getMonth()
      const date = d.getDate()
      const w = d.getDay()
      const compareDate = d.setDate(date - w)
      this.db.find({ lastUpdate: { $gt: compareDate } }, (err, docs) => {
        if (err) {
          console.error(err)
        }
        for (let i of docs) {
          this.taskDb.find({ $and: [ { lastUpdate: { $gt: compareDate } }, { parentName: i.ticketName } ] }, (err, tasks) => {
            if (err) {
              console.error(err)
            }
            data += `\n## ${i.ticketName}\n`
            for (let j of tasks) {
              data += `- ${j.taskName}\n予定工数：${this.formatPlan(j.taskPlan)} 実工数：${j.taskActual}\n`
            }
          })
        }
        setTimeout(() => {
          blob = new Blob([data], { 'type': 'text/markdown' })
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = `${month + 1}/${date}.md`
          link.click()
        }, 200)
      })
    },
    sort: function () {
    }
  }
}
</script>
<style>
.md-app {
    height: 100vh;
    border: 1px solid rgba(#000, .12);
}
.left {
  float: left;
}
.right {
  float: right;
}
</style>
