<template>
  <md-card md-with-hover :class="{'md-primary': isDone}" >
    <md-ripple>
    <router-link :to="{ name: 'detail-page', params: {id:  ticketData._id, name: ticketData.ticketName, phase: ticketData.phase }}">
      <md-card-header>
        <div class="md-title">{{ ticketData.ticketName }}</div>
      </md-card-header>
      <md-card-content>
        <md-list>
          <md-list-item>
            <icon name="label" color="gray" scale="1.5"></icon>
            <span class="md-list-item-text">タグ:{{ ticketData.phase }}</span>
          </md-list-item>
          <md-list-item>
            <icon name="event" color="gray" scale="1.5"></icon>
            <span class="md-list-item-text">開始日:{{ ticketData.startDate | moment("YYYY/MM/DD") }}</span>
          </md-list-item>
          <md-list-item>
            <icon name="event" color="gray" scale="1.5"></icon>
            <span class="md-list-item-text">期日:{{ ticketData.dueDate | moment('YYYY/MM/DD') }}</span>
          </md-list-item>
          <md-list-item>
            <icon name="schedule" color="gray" scale="1.5"></icon>
            <span class="md-list-item-text">予定工数:{{ ticketData.plan }}</span>
          </md-list-item>
          <md-list-item>
            <icon name="watch_later" color="gray" scale="1.5"></icon>
            <span class="md-list-item-text">実工数:{{ ticketData.actual }}</span>
          </md-list-item>
          <md-list-item>
            <icon name="done_all" color="gray" scale="1.5"></icon>
            <span class="md-list-item-text">進捗率:{{ progress(ticketData.done, ticketData.taskNum) }}</span>
          </md-list-item>
          <md-list-item>
            <icon name="warning" color="gray" scale="1.5"></icon>
            <span class="md-list-item-text">遅延状況:{{ calcDelay(ticketData.plan, ticketData.actual) }}</span>
          </md-list-item>
        </md-list>
       </md-card-content>
      </router-link>
      <md-card-actions>
        <md-button @click="edit">編集</md-button>
        <md-button @click="archive">アーカイブ</md-button>
      </md-card-actions>
    </md-ripple>
  </md-card>
</template>
<script>
    export default {
      name: 'big-task',
      data: () => ({
        isDone: false
      }),
      props: {
        ticketData: {
          type: Object,
          default: {
            id: 1,
            ticketName: 'default',
            phase: 'default',
            startDate: '2019/01/22',
            dueDate: '2019/03/11',
            plan: 0,
            actual: 0,
            progress: 0,
            delay: 0
          },
          required: true
        }
      },
      computed: {
        progress: function () {
          return function (a, b) {
            let answer = 0
            if (b !== 0) {
              answer = a / b
            }
            answer *= 100
            answer = Math.floor(answer)
            answer = answer + '%'
            if (answer === '100%') {
              this.isDone = true
            }
            return answer
          }
        },
        formatPlan: function () {
          return function (plan) {
            let h = Math.floor(plan)
            let m
            let list = String(plan).split('.')
            if (list.length > 1) {
              m = parseFloat('0.' + String(plan).split('.')[1])
              m = Math.floor(m * 60)
              m = ('0' + m).slice(-2)
            } else {
              m = '00'
            }
            const formatedPlan = h + ':' + m + ':00'
            return formatedPlan
          }
        },
        calcDelay: function () {
          return function (plan, actual) {
            let delay
            console.log(`plan${plan}`)
            const planList = plan.split(':')
            console.log(`split${planList}`)
            const actualList = actual.split(':')
            const planH = parseInt(planList[0])
            const planM = parseInt(planList[1])
            const actualH = parseInt(actualList[0])
            const actualM = parseInt(actualList[1])
            if (actualH < planH) {
              delay = '00:00:00'
            } else if (actualH === planH) {
              if (actualM <= planM) {
                delay = '00:00:00'
              } else {
                let delayM = actualM - planM
                delayM = ('0' + delayM).slice(-2)
                delay = '00:' + delayM + ':00'
              }
            } else {
              let delayH = actualH - planH
              if (actualM <= planM) {
                delay = delayH + ':00:00'
              } else {
                let delayM = actualM - planM
                delayM = ('0' + delayM).slice(-2)
                delay = delayH + ':' + delayM + ':00'
              }
            }
            return delay
          }
        }
      },
      methods: {
        edit () {
          this.$emit('editTicket')
        },
        archive () {
          this.$emit('archiveTicket')
        }
      }
    }
</script>
<style lang="scss" scoped>
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: md-get-palette-color(grey, A200), // The primary color of your application
  accent: md-get-palette-color(pink, 500) // The accent or secondary color
));

@import "~vue-material/dist/theme/all"; // Apply the theme

  @import "~vue-material/src/base/theme";
  @import "~vue-material/src/components/MdCard/theme";
  .md-card {
    width: 320px;
    margin: 14px;
    display: inline-block;
    vertical-align: top;
  }
</style>
