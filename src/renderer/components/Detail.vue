<template>
  <div class="page-container">
    <md-app md-waterfall md-mode="fixed">
        <md-app-toolbar class="md-primary" >
          <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
          <icon name="menu" color="white" scale="2"></icon>
        </md-button>
            <span class="md-title">Time-Tracker</span>
        </md-app-toolbar>
        <md-app-drawer :md-active.sync="menuVisible">
    	    <side-bar />
        </md-app-drawer>
		<md-app-content>
          <md-table class="md-card">
            <md-table-toolbar>
              <h1 class="md-title">{{ ticketData.ticketName }}</h1>
            </md-table-toolbar>
            <md-table-row>
              <md-table-head>タグ</md-table-head>
              <md-table-head>開始日</md-table-head>
              <md-table-head>期日</md-table-head>
              <md-table-head>予定工数</md-table-head>
              <md-table-head>実工数</md-table-head>
            </md-table-row>
            <md-table-row>
              <md-table-cell>{{ ticketData.phase }}</md-table-cell>
              <md-table-cell>{{ ticketData.startDate | moment('YYYY/MM/DD')  }}</md-table-cell>
              <md-table-cell>{{ ticketData.dueDate | moment('YYYY/MM/DD') }}</md-table-cell>
              <md-table-cell>{{ formatPlan(ticketData.plan) }}</md-table-cell>
              <md-table-cell>{{ gatherActual }}</md-table-cell>
            </md-table-row>
          </md-table>
		  <div class="md-layout md-gutter" v-if="searchResult">
		    <md-card v-for="item in task" :key=item._id :class="finishedClass(item)">
			  <md-card-header>
				<div class="md-title">{{ item.taskName }}</div>
			  </md-card-header>
			  <md-card-content>
          	    <md-list>
                  <md-list-item>
                    <icon name="alarm" color="gray" scale="1.5"></icon>
                    <span class="md-list-item-text">予定工数: {{ formatPlan(item.taskPlan) }}</span>
				  </md-list-item>
				  <md-list-item>
                    <icon name="alarm_add" color="gray" scale="1.5"></icon>
                    <span class="md-list-item-text">実工数: {{ item.taskActual }}</span>
				  </md-list-item>
                <md-list-item>
                    <icon name="done" color="gray" scale="1.5"></icon>
                    <span class="md-list-item-text">完了</span>
                    <md-switch v-model="item.finished" @change="taskFinished(item)"></md-switch>
                </md-list-item>
				</md-list>
			  </md-card-content>
              <md-card-actions>
                <md-button @click="startTimer(item)">{{ item.timeButton }}</md-button>
                <md-button @click="saveTime(item)">記録</md-button>
              </md-card-actions>
			</md-card> 
		  </div>
          <md-empty-state v-else
            md-rounded
            md-label="まだタスクが登録されていません。"
            md-description="右下の＋ボタンを押して新規タスクを追加しましょう。">
            <md-avatar class="mim"><img src="/assets/task.png" alt="Avatar"></md-avatar>
          </md-empty-state>
          <md-button class="md-fab md-primary md-fixed md-fab-bottom-right" @click="showDialog = true">
            <icon name="add" color="white"></icon>
          </md-button>
          <md-snackbar :md-active.sync="showSnack">チケットの追加に成功しました。</md-snackbar>
          <md-snackbar :md-active.sync="showSnack2">タスクの保存に成功しました。</md-snackbar>  
          <md-progress-bar md-mode="indeterminate" v-if="sending" />
        </md-app-content>
    </md-app>
    <div>
        <md-dialog :md-active.sync="showDialog">
          <md-dialog-title>タスク追加</md-dialog-title>
          <form novalidate class="md-layout md-gutter" @submit.prevent="validate">
                <div class="md-layout-item ma">
                  <md-field :class="getValidationClass('taskName')">
				    <label for="task-name">タスク名</label>
				    <md-input name="task-name" id="task-name" v-model="form.taskName" :disabled="sending" />
          	        <span class="md-error" v-if="!$v.form.taskName.required">Task name is required</span>
		  	      </md-field>
			    </div>
			    <div class="md-layout-item ma">
			      <md-field :class="getValidationClass('taskPlan')">
				    <label for="taskPlan">予定工数</label>
				    <md-input name="taskPlan" id="taskPlan" v-model="form.taskPlan" type="number" />
          	        <span class="md-error" v-if="!$v.form.taskPlan.required">Plan is required</span>
		  	      </md-field>
			    </div>
		    <md-dialog-actions class="md-layout-item">
              <md-button class="md-primary ma" @click="showDialog = false">Close</md-button>
              <md-button type="submit" class="md-primary ma">Save</md-button>
            </md-dialog-actions>
          </form>
        </md-dialog>
    </div>
  </div>
</template>

<script>
  import SideBar from '@/components/Template/SideBar'
  import Datastore from 'nedb'
  import { validationMixin } from 'vuelidate'
  import { required } from 'vuelidate/lib/validators'
  const format = val => ('0' + val).slice(-2)
  export default {
    name: 'detail-page',
    mixins: [validationMixin],
    components: {
      SideBar
    },
    data: () => ({
      menuVisible: false,
      showDialog: false,
      showSnack: false,
      showSnack2: false,
      sending: false,
      form: {
        taskPlan: null,
        taskName: null
      },
      task: null,
      ticketData: null,
      taskNum: 0,
      db: new Datastore({
        filename: 'data/data.js',
        autoload: true
      }),
      taskDb: new Datastore({
        filename: 'data/task.js',
        autoload: true
      }),
      searchResult: false
    }),
    created: function () {
      this.db.find({ _id: this.$route.params.id }, (err, docs) => {
        if (err) {
          console.error(err)
        }
        this.ticketData = docs[0]
        this.taskNum = this.ticketData.taskNum
      })
      this.taskDb.find({ parentId: this.$route.params.id }, (err, docs) => {
        if (err) {
          console.error(err)
        }
        this.task = docs
        if (docs[0] !== void 0) {
          this.searchResult = true
        }
      })
    },
    computed: {
      gatherActual: function () {
        let total = '00:00:00'
        let totalH = 0
        let totalM = 0
        let totalS = 0
        if (this.task !== void 0 && this.task !== null) {
          for (let i of this.task) {
            if (i.taskActual != null) {
              const list = i.taskActual.split(':')
              let h = parseInt(list[0])
              let m = parseInt(list[1])
              let s = parseInt(list[2])
              totalS += parseInt(s)
              if (totalS >= 60) {
                totalM++
                totalS -= 60
              }
              totalM += parseInt(m)
              if (totalM >= 60) {
                totalH++
                totalM -= 60
              }
              totalH += parseInt(h)
            }
          }
        }
        totalH = format(totalH)
        totalM = format(totalM)
        totalS = format(totalS)
        total = totalH + ':' + totalM + ':' + totalS
        return total
      },
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
      finishedClass: function () {
        return function (item) {
          return { 'md-primary': item.finished }
        }
      }
    },
    validations: {
      form: {
        taskName: {
          required
        },
        taskPlan: {
          required
        }
      }
    },
    methods: {
      open (link) {
        require('electron').shell.openExternal(link)
      },
      startTimer: function (item) {
        if (item.timeButton === '時間計測') {
          if (item.timer) {
            clearInterval(item.timer)
          }
          item.timeButton = '一時停止'
          const list = item.taskActual.split(':')
          let h = parseInt(list[0])
          let m = parseInt(list[1])
          let s = parseInt(list[2])
          item.timer = setInterval(() => {
            if (parseInt(m) === 59 && parseInt(s) === 59) {
              m = 0
              s = 0
              h = parseInt(h) + 1
            } else if (parseInt(m) === 59) {
              m = 0
              h = parseInt(h) + 1
            } else if (parseInt(s) === 59) {
              s = 0
              m = parseInt(m) + 1
            } else {
              s = parseInt(s) + 1
            }
            s = format(s)
            m = format(m)
            item.taskActual = h + ':' + m + ':' + s
          }, 1000)
          this.taskDb.update({ _id: item._id }, { $set: { lastUpdate: Date.now() } })
          this.db.update({ parentId: item._id }, { $set: { lastUpdate: Date.now() } })
        } else {
          item.timeButton = '時間計測'
          clearInterval(item.timer)
        }
      },
      getValidationClass (fieldName) {
        const field = this.$v.form[fieldName]
        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
      },
      clearForm () {
        this.$v.$reset()
        this.form.taskName = null
        this.form.taskPlan = null
      },
      registerTicket () {
        this.sending = true
        this.showSnack = true
        this.showDialog = false
        const doc = {
          parentId: this.$route.params.id,
          parentName: this.$route.params.name,
          taskName: this.form.taskName,
          taskPlan: this.form.taskPlan,
          taskActual: '00:00:00',
          timer: null,
          timeButton: '時間計測',
          finished: false,
          lastUpdate: null
        }
        this.taskDb.insert(doc)
        this.db.update({ _id: this.$route.params.id }, { $set: { taskNum: this.ticketData.taskNum + 1 } }, {})
        this.clearForm()
        this.sending = false
        this.taskDb.find({ parentId: this.$route.params.id }, (err, docs) => {
          if (err) {
            console.error(err)
          }
          this.task = docs
          this.searchResult = true
        })
        this.db.find({ _id: this.$route.params.id }, (err, docs) => {
          if (err) {
            console.error(err)
          }
          this.ticketData = docs[0]
        })
      },
      saveTime (item) {
        this.taskDb.update({ _id: item._id }, { $set: { taskActual: item.taskActual } }, {}, (err, updNum) => {
          if (err) {
            console.error(err)
          }
        })
        this.db.update({ _id: item.parentId }, { $set: { actual: this.gatherActual, lastUpdate: Date.now() } }, {}, (err, updNum) => {
          if (err) {
            console.error(err)
          }
        })
        this.showSnack2 = true
      },
      validate () {
        this.$v.$touch()
        if (!this.$v.$invalid) {
          this.registerTicket()
        }
      },
      taskFinished (item) {
        if (item.finished) {
          this.db.update({ _id: this.$route.params.id }, { $set: { done: this.ticketData.done + 1 } }, {}, (err, count) => {
            if (err) {
              console.error(err)
            }
          })
          this.taskDb.update({ _id: item._id }, { $set: { finished: true } })
        } else {
          this.db.update({ _id: this.$route.params.id }, { $set: { done: this.ticketData.done - 1 } })
          this.taskDb.update({ _id: item._id }, { $set: {finished: false} })
        }
        this.db.find({ _id: this.$route.params.id }, (err, docs) => {
          if (err) {
            console.error(err)
          }
          this.ticketData = docs[0]
        })
      }
    }
  }
</script>
<style>
.md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
}
.md-table-head {
    font-size: 18px;
}
.relative {
    position:relative;
}
.migishita {
    position:fixed;
    right:0;
    bottom:0;
}
.md-app {
    max-height: 770px;
    height: 770px;
    border: 1px solid rgba(#000, .12);
}
.ma {
    margin: 12px;
}
.md-dialog {
    max-width: 1200px;
}
.mim {
    margin-top: -20px;
    position:absolute;
    z-index:-1;
    width:75%;
    height:75%;
}
</style>
