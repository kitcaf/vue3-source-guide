const queue: any[] = []
// 直接Promise.resolve()，then(fn) 控制fn进入微队列
const p = Promise.resolve()
// 表示是否进行过一次的调度（指的是将flushJobs放入到微队列）
// 一次事件的循环只需要放一次，flushJobs执行queue里面的所有组件更新任务
let isFlushPending = false

export function nextTick(fn?: () => void) {
    //  p.then(fn) 将fn放入到微队列中
    return fn ? p.then(fn) : p
}

/**
 * setupRenderEffect 中外部调用函数
 * @param job 某组件的更新函数 instance.update
 */
export function queueJob(job: any) {
    // 去重，保证一个组件的更新函数只需一个
    if (!queue.includes(job)) {
        queue.push(job)
        // 执行调度到微队列
        queueFlush()
    }
}

function queueFlush() {
    // 如果isFlushPending=true，表示当前事件循环已经flushJobs放入微队列里了
    if (isFlushPending) return
    isFlushPending = true

    nextTick(flushJobs)
}

// 最终微队列的任务函数
function flushJobs() {
    // 执行了微队列的函数，isFlushPending可以设置回false
    isFlushPending = false
    // 排序
    queue.sort((a, b) => a.id - b.id)
    let job;
    while ((job = queue.shift()) != undefined) {
        job && job()
    }
}