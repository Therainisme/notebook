---
title: 关于 Golang 的并发非阻塞缓存
authors: [Therainisme]
tags: [Go]
date: 2022-2-7
---

接下来将使用下面的 httpGetBody 作为需要缓存的函数的一个样例。它会去进行 HTTP GET 请求，并获取 HTTP 响应 Body。对于这个函数的调用开销是比较大的，现在想对每一个 URL 进行的 HTTP GET 请求的结果保存下来。

<!--truncate-->

它大概是长这个样子的。

```go
func httpGetBody(url string) (interface{}, error) {
    resp, err := http.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return ioutil.ReadAll(resp.Body)
}
```

:::tip 用人话说
httpGetBody 首次调用会进行 HTTP 请求，然后将结果保存在内存中，之后再次调用会直接返回内存中的结果。
:::

## Memo 初稿

### 设计

Func 它就对应类似 HttpGetBody 的函数。

```go
type Func func(key string) (interface{}, error)
```

result 用于储存函数调用结果的结构体。

```go
type result struct {
    value interface{}
    err   error
}
```

每一个 Memo 只能管理一个函数，不同参数的调用都会储存在该结构体的 cache 中。cache 是一个 map，key 是函数的参数，value 储存函数的返回值。

```go
type Memo struct {
    f Func
    cache map[string]result
}
```

简单的实现思路：通过 New 函数创建一个 Memo 对象，使用的时候直接调用 Get 方法即可。

* 如果这个函数调用结果没有缓存过，先调用得到结果，保存在 cache 中之后再返回。
* 如果这个函数调用结果缓存中有了，直接返回结果。


```go
func NewMemo(f Func) *Memo {
    return &Memo{
        f: f,
        cache: make(map[string]result),
    }
}

func (memo *Memo) Get(key string) (interface{}, error) {
    res, ok := memo.cache[key]
    if !ok {
        res.Value, res.err = memo.f(key)
        memo.cache[key] = res
    }

    return res.Value, res.err
}
```

### 使用

对于每一次传入 URL 调用函数，Memo 都会打印调用延迟和数据大小。

```go
m := NewMemo(httpGetBody)

for _, url := range incomingURLs() {
	start := time.Now()

	value, err := m.Get(url)
	if err != nil {
		log.Print(err)
		continue
	}

	fmt.Printf("%s, %s, %d bytes\n", url, time.Since(start), len(value.([]byte)))
}
```

从下面的测试结果可以看出，尽管第一次对每一个 URL 的 Get 调用都会花上几百毫秒，但是第二次的 Get 调用几乎不耗费多少时间（看开始和结束两行的 www.bing.com 和 www.bilibili.com）。

```shell
=== RUN   TestMemo1
https://www.bing.com,          949.4794ms, 77839 bytes
https://www.bilibili.com,      693.254ms,  3530 bytes
https://www.educoder.net,      216.8409ms, 4684 bytes
https://zh-hans.reactjs.org/,  300.9549ms, 82860 bytes
https://cn.vuejs.org/,         569.8065ms, 44402 bytes
https://www.acwing.com/,       778.4867ms, 112157 bytes
https://www.bing.com,          0s,         77839 bytes
https://www.bilibili.com,      0s,         3530 bytes
--- PASS: TestMemo1 (3.51s)
PASS
ok      mymemo  4.166s
```

但是，如果测试的时候改成了并发的版本，会出现有两个 goroutine 在没有同步干预的情况下更新 cache map。这表明 Memo 的 Get 方法不是并发安全的，存在数据竞争。

```go
m := NewMemo(httpGetBody)
var n sync.WaitGroup

for _, url := range incomingURLs() {
	n.Add(1)

	go func(url string) {
		start := time.Now()
		value, err := m.Get(url)
		if err != nil {
			log.Print(err)
			return
		}
		fmt.Printf("%s, %s, %d bytes\n", url, time.Since(start), len(value.([]byte)))

		n.Done()
	}(url)
}

n.Wait()
```

:::caution 注意
在 Go 语言程序设计中，使用了 -race 这个 flag 运行程序，通过浏览竞争检测器打印的报告分析。但我的电脑出现了这样的错误，暂未解决。

`cc1.exe: sorry, unimplemented: 64-bit mode not compiled in`
:::

## Memo2：解决竞争问题

最简单的方式是给 Memo 加上一个 mutex，在 Get 的开始获取互斥锁，return 的时候释放锁，就可以让 cache 的操作发生在临界区内了。

```go {3,8,14}
type Memo struct {
    f     Func
    mu    sync.Mutex
    cache map[string]result
}

func (memo *Memo) Get(key string) (value interface{}, err error) {
    memo.mu.Lock()
    res, ok := memo.cache[key]
    if !ok {
        res.value, res.err = memo.f(key)
        memo.cache[key] = res
    }
    memo.mu.Unlock()
    return res.value, res.err
}
```

但是这样非常的蠢，每次对 HttpGetBody 调用期间都会持有锁，将所有请求串行化了，完全丧失了并发的性能优点。

## Memo3：解决解决竞争问题时产生的问题（真正并行化）

把 Get 函数稍微改一改，在 Get 函数执行的过程中会获取两次锁：查找阶段获取一次，如果查找没有返回任何内容，会在进入更新阶段再次获取。（在这两次获取锁的中间阶段，其他 goroutine 可以随意使用 cache）

```go
func (memo *Memo) Get(key string) (value interface{}, err error) {
    memo.mu.Lock()
    res, ok := memo.cache[key]
    memo.mu.Unlock()

    if !ok {
        res.value, res.err = memo.f(key)

        memo.mu.Lock()
        memo.cache[key] = res
        memo.mu.Unlock()
    }
    return res.value, res.err
}
```

虽然性能得到了提升，但是又会产生另外一个问题：多个 goroutine 一起查询 cache，发现没有值，然后一起调用 HttpGetBody 这个非常慢的函数。在得到结果后，也都会去更新 map，其中一个获得的结果会覆盖掉另一个的结果。

## Memo4：再改

下面版本的 Memo 每一个 map 元素都是指向一个 entry 的指针。每一个 entry 包含对函数 HttpGetBody 调用结果的内容缓存。与之前不同的是这次 entry 还包含了一个叫 ready 的 channel。在 entry 的 res 被设置之后，这个 channel 就会被关闭，以向其它 goroutine 广播去读取该条目内的结果是安全的了。

```go
type entry struct {
    res   result
    ready chan struct{} // 当这个 channel 被关闭时代表 res 的数据准备好了
}

func NewMemo(f Func) *Memo {
    return &Memo{f: f, cache: make(map[string]*entry)}
}

type Memo struct {
    f     Func
    mu    sync.Mutex 
    cache map[string]*entry
}

func (memo *Memo) Get(key string) (value interface{}, err error) {
    memo.mu.Lock()
    e := memo.cache[key]
    if e == nil {
        // 首次进入
        
        // 新建了一个 entry，赋值给了 Memo
        // 保证后续调用 Get 函数时，不会返回 nil
        e = &entry{ready: make(chan struct{})} 
        memo.cache[key] = e
        memo.mu.Unlock()

        // 等待数据就位 
        e.res.value, e.res.err = memo.f(key)

        // 数据就位，关闭 ready channel
        // 通知其他阻塞在尝试读 ready channle 的 goroutine 继续执行
        close(e.ready) 
    } else {
        // 非首次进入
        memo.mu.Unlock()

        // 这里会一直阻塞，直到 e.ready 被关闭
        <-e.ready 
    }
    return e.res.value, e.res.err
}
```

:::tip go channel 相关
* 当一个 channel 被关闭后，再向该 channel 发送数据将导致 panic 异常。
* 当一个被关闭的 channel 中已经发送的数据都被成功接收后，后续的接收操作将不再阻塞，它们会立即返回一个零值。
* 试图重复关闭一个 channel 将导致 panic 异常，试图关闭一个 nil 值的 channel 也将导致 panic 异常。
* 没有办法直接测试一个 channel 是否被关闭，但是接收操作有一个变体形式：它多接收一个结果，多接收的第二个结果是一个布尔值 ok。true 表示成功从 channels 接收到值，false 表示 channels 已经被关闭并且里面没有值可接收。
:::

## Memo5：最后一改！

Func、result 和 entry 的声明和之前保持一致：

```go
type Func func(key string) (interface{}, error)

// 一个 result 是一次函数调用的结果
type result struct {
    value interface{}
    err   error
}

type entry struct {
    res   result
    ready chan struct{} // 当这个 channel 被关闭时代表 res 的数据准备好了
}
```

我觉得这里直接看代码的注释会更好理解，把每个函数的功能单独看。

```go
// 一个 request 会送到 Memo 的 requests 中
// 函数的调用结果能从 response channel 中读取
type request struct {
    key      string
    response chan<- result // the client wants a single result
}

type Memo struct{ 
    requests chan request // 这里可能会有很多请求（request）
}

// Memo 新建了一个 channel
在 Memo 不用之后需要手动调用 Close 关闭
func NewMemo(f Func) *Memo {
    memo := &Memo{
        requests: make(chan request)
    }

    go memo.server(f) // 后文有说明

    return memo
}

func (memo *Memo) Get(key string) (interface{}, error) {
    response := make(chan result)

    // 把这个 response 丢给 requests 里边
    memo.requests <- request{key, response}

    // 等待刚刚丢进去的 response 取值就行了
    res := <-response
    return res.value, res.err
}

func (memo *Memo) Close() { 
    close(memo.requests) 
}
```

下面的函数非常重要。

```go
// 这个函数在 NewMemo 时放到了新 goroutine 中执行
func (memo *Memo) server(f Func) {
    // 这个 cache 从 Memo 中抽离了出来
    // 它储存所有函数不同参数调用的 entry
    cache := make(map[string]*entry)

    // memo.requests 是一个 channel
    // 如果它不 close 的话
    // for 循环会一直阻塞在这
    for req := range memo.requests {

        e := cache[req.key]
        if e == nil {
            // 首次进入
            e = &entry{
                ready: make(chan struct{})
            }
            // 阻止后续访问相同 key 的 goroutine 进入这个 if
            cache[req.key] = e

            // 调用函数开始获取结果
            go e.call(f, req.key)
        }

        // 获取结果
        go e.deliver(req.response)
    }
}

func (e *entry) call(f Func, key string) {
    e.res.value, e.res.err = f(key)

    // 通过关闭 channel 广播数据可用的消息
    close(e.ready)
}

func (e *entry) deliver(response chan<- result) {

    // 这里会一直阻塞，直到 e.ready 被关闭
    <-e.ready

    // 数据可用了，向 response 送出结果
    response <- e.res
}
```

## 最后

不论用以上锁还是以通信开发并发程序都是可行的。“不管黑猫白猫，能捉老鼠的就是好猫”

## 参考

* [Go 语言程序设计——实例：并发的非阻塞缓存](https://books.studygolang.com/gopl-zh/ch9/ch9-07.html)