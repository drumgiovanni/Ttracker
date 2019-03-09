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
          <div class="md-layout md-gutter relative">
            <!-- チケットを並べる -->
            <big-task v-for="item in ticketData" :key=item.lastUpdate class="md-layout-item md-size-30" 
              :ticketData=item  @editTicket="editTicket(item)" @archiveTicket="archiveTicket(item)" 
              @startTimer="startTimer(item)" ></big-task>
            <md-empty-state v-if="!searchResult" class="relative"
              md-rounded
              md-label="まだチケットが登録されていません。"
              md-description="下の＋ボタンを押して新規チケットを追加しましょう。">
              <md-avatar class="mim"><img src="static/task.png" ></md-avatar>
            </md-empty-state>  
            <md-button class="md-fab md-primary md-fixed md-fab-bottom-right" @click="showDialog = true">
              <icon name="add" color="white"></icon>
            </md-button>
            <md-snackbar :md-active.sync="showSnack">チケットの追加に成功しました。</md-snackbar>  
          </div>
        </md-app-content>
    </md-app>
      <div>
        <md-dialog :md-active.sync="showDialog">
          <md-dialog-title>チケット追加</md-dialog-title>
          <form novalidate class="md-layout md-gutter" @submit.prevent="validate">
            <div class="md-layout-item ma">
              <md-field :class="getValidationClass('ticketName')">
				        <label for="ticket-name">チケット名</label>
				        <md-input name="ticket-name" id="ticket-name" v-model="form.ticketName" :disabled="sending" />
                <span class="md-error" v-if="!$v.form.ticketName.required">Ticket name is required</span>
		  	      </md-field>
			      </div>
			      <div class="md-layout-item ma">
			        <md-field :class="getValidationClass('phase')">
                <label for="phase">タグ</label>
                <md-input name="phase" id="phase" v-model="form.phase" :disabled="sending" />
		          </md-field>
			      </div>
            <div class="md-layout-item ma">
              <md-datepicker v-model="form.startDate" md-immediately :class="getValidationClass('startDate')">
				      <label for="ticket-name">開始日</label>
              </md-datepicker>
			      </div>
            <div class="md-layout-item ma" :class="getValidationClass('dueDate')">
              <md-datepicker v-model="form.dueDate" md-immediately @input="dateValidate">
			  	      <label for="ticket-name">期日</label>
              </md-datepicker>
              <span class="red" v-if="!ok">期日は開始日より後の日付を設定してください</span>
            </div>
            <md-progress-bar md-mode="indeterminate" v-if="sending" />
		        <md-dialog-actions class="md-layout-item">
              <md-button class="md-primary ma" @click="close">Close</md-button>
              <md-button type="submit" class="md-primary ma">{{ button }}</md-button>
            </md-dialog-actions>
          </form>
        </md-dialog>
      </div>
  </div>
</template>

<script>
  import BigTask from '@/components/LandingPage/BigTask'
  import SideBar from '@/components/Template/SideBar'
  import { validationMixin } from 'vuelidate'
  import { required } from 'vuelidate/lib/validators'
  import Datastore from 'nedb'
  import { remote } from 'electron'
  import path from 'path'
  export default {
    name: 'landing-page',
    mixins: [validationMixin],
    data: () => ({
      menuVisible: false,
      showDialog: false,
      showSnack: false,
      sending: false,
      searchResult: false,
      button: 'register',
      form: {
        ticketName: null,
        phase: null,
        startDate: null,
        dueDate: null,
        id: null
      },
      ticketData: null,
      db: new Datastore({
        filename: path.join(remote.app.getPath('userData'), '/data.js'),
        autoload: true
      }),
      taskDb: new Datastore({
        filename: path.join(remote.app.getPath('userData'), '/task.js'),
        autoload: true
      }),
      archived: new Datastore({
        filename: path.join(remote.app.getPath('userData'), '/archive.js'),
        autoload: true
      }),
      ok: true
    }),
    created: function () {
      // 画面描画前にチケットデータを取得する
      // チケットデータを取得する際にチケットの最終更新日時順に降順ソートする
      this.db.find({}).sort({ lastUpdate: -1 }).exec((err, docs) => {
        if (err) {
          console.error(err)
        }
        this.ticketData = docs
        if (docs.length >= 1) {
          this.searchResult = true
        }
      })
    },
    validations: {
      form: {
        ticketName: {
          required
        },
        phase: {
          required
        },
        startDate: {
          required
        },
        dueDate: {
          required
        }
      }
    },
    components: {
      BigTask,
      SideBar
    },
    methods: {
      open (link) {
        require('electron').shell.openExternal(link)
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
        this.form.ticketName = null
        this.form.phase = null
        this.form.startDate = null
        this.form.dueDate = null
        this.button = 'register'
      },
      registerTicket () {
        this.sending = true
        this.showSnack = true
        this.showDialog = false
        const doc = {
          ticketName: this.form.ticketName,
          phase: this.form.phase,
          startDate: this.form.startDate,
          dueDate: this.form.dueDate,
          plan: '00:00:00',
          actual: '00:00:00',
          taskNum: 0,
          done: 0,
          progress: 0,
          delay: '00:00:00',
          lastUpdate: null
        }
        if (this.button === 'register') {
          this.db.insert(doc)
          this.searchResult = true
        } else if (this.button === 'update') {
          this.db.update({ _id: this.form.id }, doc, {}, (err, numReplaced) => {
            console.error(err)
          })
          this.taskDb.update({ _id: this.form.id }, { $set: { parentName: this.form.ticketName } })
        }
        this.clearForm()
        this.sending = false
        this.db.find({}, (err, docs) => {
          if (err) {
            console.error(err)
          }
          this.ticketData = docs
        })
      },
      validate () {
        this.$v.$touch()
        if (!this.$v.$invalid && this.ok) {
          this.registerTicket()
        }
      },
      editTicket (item) {
        this.showDialog = true
        this.form.ticketName = item.ticketName
        this.form.phase = item.phase
        this.form.startDate = item.startDate
        this.form.dueDate = item.dueDate
        this.form.id = item._id
        this.button = 'update'
      },
      close () {
        this.showDialog = false
        this.clearForm()
        this.button = 'register'
      },
      archiveTicket (item) {
        this.archived.insert(item)
        this.db.remove({ _id: item._id }, {}, (err, numRemoved) => {
          if (err) {
            console.error(err)
          }
          this.taskDb.remove({ parentId: item._id }, { multi: true }, (err, num) => {
            if (err) {
              console.error(err)
            }
          })
          this.db.find({}, (err, docs) => {
            if (err) {
              console.error(err)
            }
            this.ticketData = docs
          })
        })
      },
      dateValidate (e) {
        this.ok = (e >= this.form.startDate)
      }
    }
  }
</script>
<style>
.md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
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
    height: 100vh;
    border: 1px solid rgba(#000, .12);
}
.md-dialog {
    max-width: 1200px;
}
.ma {
    margin: 12px;
}
.red {
  color: red;
}
.bottom {
  top: 69%;
}
</style>
