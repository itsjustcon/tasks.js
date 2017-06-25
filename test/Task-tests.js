/**
 * Task-tests.js
 * -------------
 * USAGE:
 *   mocha test/Task-tests.js
 *   mocha --watch src/Task.js test/Task-tests.js
 */

import _ from 'lodash'
import chai, { expect } from 'chai'
import faker from 'faker'
import Promise from 'bluebird'
import sinon from 'sinon'

import DeferredPromise from '@itsjustcon/utils/promise-deferred'
import Task from '../src/Task'

chai.use(require('sinon-chai'));



describe('Task', () => {

    describe('constructor', () => {

        it('should set name from string', () => {
            const task = new Task('myTaskName', function executor() {});
            expect(task).to.have.property('name').that.equals('myTaskName');
        })
        it('should set name from function if no string is given', () => {
            const task = new Task(function executor() {});
            expect(task).to.have.property('name').that.equals('executor');
        })

        it('should not immediately invoke the executor', () => {
            const executor = sinon.spy();
            const task = new Task(executor);
            expect(executor).to.have.not.been.called;
        })

    })

    describe.skip('#name', () => {

        it('should ...')

    })

    describe('#isRunning', () => {

        it('should be set to false by default', () => {
            const promise = new DeferredPromise();
            const task = new Task(() => promise);
            expect(task).to.have.property('isRunning').that.equals(false);
        })

        it('should be set to true when running', () => {
            const promise = new DeferredPromise();
            const task = new Task(() => promise);
            expect(task).to.have.property('isRunning').that.equals(false);
            task.run();
            expect(task).to.have.property('isRunning').that.equals(true);
            promise.resolve();
        })

        it('should be set to false after finishing', async () => {
            const promise = new DeferredPromise();
            const task = new Task(() => promise);
            expect(task).to.have.property('isRunning').that.equals(false);
            task.run();
            expect(task).to.have.property('isRunning').that.equals(true);
            promise.resolve();
            await promise;
            expect(task).to.have.property('isRunning').that.equals(false);
        })

    })

    describe('#run()', () => {

        it('should return `this`', () => {
            const task = new Task(() => null);
            expect(task.run()).to.equal(task);
        })

        it('should invoke the executor', () => {
            const executor = sinon.spy();
            const task = new Task(executor);
            expect(executor).to.have.not.been.called;
            task.run();
            expect(executor).to.have.been.called;
            expect(executor).to.have.been.calledOnce;
        })

        it('should set #isRunning to true', () => {
            const promise = new DeferredPromise();
            const task = new Task(() => promise);
            expect(task).to.have.property('isRunning').that.equals(false);
            task.run();
            //expect(task.run).to.change(task, 'isRunning');
            expect(task).to.have.property('isRunning').that.equals(true);
            promise.resolve();
        })

    })

    context.skip('Observable', () => {

        describe('#subscribe()', () => {

            it('should ...')

        })

        describe('#dispose()', () => {

            it('should ...')

        })

    })

    context('Promise', () => {

        describe('#then()', () => {

            it('should return a Promise', () => {
                const task = new Task(() => null);
                //expect(task.then(() => null)).to.be.a('promise');
                expect(task.then(() => null)).to.be.an.instanceof(Promise);
            })
            it('should still return a Promise if #isRunning is false', () => {
                const task = new Task(() => null);
                expect(task).to.have.property('isRunning').that.equals(false);
                //expect(task.then()).to.be.a('promise');
                expect(task.then()).to.be.an.instanceof(Promise);
            })

            it('should handle 0 arguments')
            it('should handle 1 argument (onResolve)')
            it('should handle 2 arguments (onResolve, onReject)')

        })

        describe('#catch()', () => {

            it('should return a Promise')
            it('should still return a Promise if #isRunning is false')

            it('should handle 0 arguments')
            it('should handle 1 argument (onReject)')

        })

    })

    context('executor', () => {

        it('should be passed a function argument', () => {
            const executor = sinon.spy();
            const task = new Task(executor).run();
            expect(executor.getCall(0).args[0]).to.be.a('function');
        })

        it('should notify next() subscribers of all events passed to action()', () => {
            const promise = new DeferredPromise();
            const executor = sinon.stub().returns(promise);
            const task = new Task(executor);
            const nextFn = sinon.spy();
            task.subscribe({ next: nextFn }).run();
            const action = executor.getCall(0).args[0];
            for (let i = 0; i < _.random(10, 100); i++) {
                const data = faker.random.words();
                action(data);
                expect(nextFn.lastCall).to.have.been.calledWith(data);
            }
            promise.resolve();
        })

        it('should notify error() subscribers of a synchronous error', () => {
            const error = new Error('my error');
            //const task = new Task(function() { throw error; });
            const task = new Task(sinon.stub().throws(error));
            const errorFn = sinon.spy();
            task.subscribe({ error: errorFn }).run();
            expect(errorFn).to.have.been.calledWith(error);
        })
        it('should notify error() subscribers of an asynchronous error', async () => {
            const error = new Error('my error');
            //const task = new Task(async function() { throw error; });
            const task = new Task(sinon.stub().rejects(error));
            const errorFn = sinon.spy();
            task.subscribe({ error: errorFn }).run();
            await task.catch(() => null);
            expect(errorFn).to.have.been.calledWith(error);
        })

    })

})
