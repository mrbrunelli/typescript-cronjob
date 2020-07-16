import { format, subDays } from 'date-fns'
import { CronJob } from 'cron'
import Task from './controllers/TaskController'

/**
 *  Seg à Sab a cada 2h entre 6h e 20h
 */

const job = new CronJob('0 0 6-20/2 * * 1,2,3,4,5,6', () => {
    let CRON_LOG = {
        running: job.running,
        lastExec: format(job.lastDate(), 'dd/MM/yyyy HH:mm:ss')
    }

    console.log('\n')
    console.log(CRON_LOG)

    const task = new Task()
    task.executeTasks()

}, null, true, 'America/Sao_Paulo')

