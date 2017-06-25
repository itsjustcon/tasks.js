/**
 * TaskQueue.js
 * ------------
 *
 * @flow
 */

//import Rx from '@reactivex/rxjs'

import Task from './Task'
import TaskError from './TaskError'

import type { Task$Executor, Task$options } from './Task'

export type TaskQueue$options = Task$options & {
    concurrency: number, // default: 1
};



class TaskQueue extends Task {

    tasks: Array<Task> = [];

    constructor(name?: string, tasks: object | Array<Task> | Task, options: TaskQueue$options) {
        super(name, (action) => {});
        if (tasks instanceof Task) {
            tasks = [ tasks ];
        }
        if (!Array.isArray(tasks)) {
            tasks = [];
        }
        this.tasks = tasks;
        //console.log('TaskQueue#constructor()', this, tasks, options);
    }

    /**
     * Internal Methods
     */
    _start(updateAction: Task$ActionUpdater) : Promise {
        updateAction(`>> ${this.name}`);
        try {
            return await Promise.map(this.tasks, async (task:Task) => {
                updateAction(`>> ${this.name} >> ${task.name}`);
                // TODO: intercept task's updateAction() and prefix your name to it's logging!
                return await task.run();
            }, { concurrency: this.concurrency });
        } catch (err) {
            // TODO: append to the TaskTrace here
            throw err;
        }
    }
    _stop() : this {
        throw new Error('TaskQueue#_stop() is not implemented!');
        if (this.isRunning) {
            this.isRunning = false;
            this._subject.complete();
        }
        return this;
        //return super._stop();
    }

}

export default TaskQueue;
