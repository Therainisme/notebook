---
title: Goroutine 和线程
authors: [Therainisme]
tags: [Go]
---

goroutine 和操作系统的线程实际上只是一个量的区别，但量变会引起质变的道理同样适用于 goroutine 和 thread。

<!--truncate-->

## 动态栈

每一个 OS thread 都有一个固定大小的内存块做栈，一般会是 2MB。这个栈会用来储存当前正在被调用或挂起的函数的内部变量。有些 goroutine 只用了 WaitGroup 后关闭 channle，对于这些 goroutine，这个 2MB 的栈对于一个小小的 goroutine 来说是很大的浪费。

有些 Go 程序会同时创建成百上千个 goroutine，如果每一个 goroutine 都需要这么大的栈，显然不太合适。

goroutine 也拥有一个和 thread 类似的栈，会保存其活跃或挂起的函数调用的本地变量。与 thread 不同，一个 goroutine 会以一个很小的栈开始其生命周期，一般只需要 2KB。而且这个栈的大小是不固定的，会根据需要动态的伸缩，最大值有 1GB。尽管很少有 goroutine 需要这么大的栈，但比传统的固定大小的 thread 栈大了许多。

## thread 调度

thread 会被操作系统内核调度。每几毫秒，一个硬件计时器会中断处理器，调用一个叫做 scheduler 的内核函数。它会挂起当前执行的 thread 并将它的寄存器保存到内存中，接着检查 thread 列表，决定下一次哪个 thread 可以被运行，并从内存中恢复该  thread 的寄存器信息，恢复执行该 thread 的现场后继续执行 thread。

OS thread 是被内核所调度，从一个 thread 向另一个 thread “移动”需要完整的上下文切换。保存一个用户 thread 的状态到内存、恢复另一个休眠的 thread 的寄存器、更新调度器的数据结构，这几部操作很慢，根据操作系统局部性原理，会增加 CPU 的运行周期。

:::tip 操作系统局部性原理
* **时间局部性**：在一个具有良好的时间局部性的程序中，被访问过一次的存储器位置很可能在不远的将来会被再次访问。
* **空间局部性**：在一个具有良好空间局部性的程序中，如果一个存储器位置被访问了一次，那么程序很可能在不远的将来访问附近的一个存储器位置。
:::

## goroutine 调度

Go 的运行时包含了其自己的调度器，它使用了一些技术手段，比如（m：n）调度。Go 调度器的工作和内核是相似的，但是它只关注单独 Go 程序中的 goroutine。

:::tip m：n 调度
在 n 个操作系统 thread 上多工（调度）m 个 goroutine
:::

和 OS thread 不同，Go 调度器并不是用一个硬件定时器，而是依赖 Go 语言本身进行进行调度的。例如：当一个 goroutine 调用了 time.Sleep，或被 channel 调用，或被 mutex 操作阻塞时，调度器会使其进入休眠并开始执行另一个 goroutine，直到时机成熟了再去唤醒之前休眠的 goroutine。

这种调度方式不需要进入内核的上下文，所以重新调度一个 goroutine 比调度一个 thread 代价要低很多。

## GOMAXPROCS

Go 调度器使用了一个叫做 GOMAXPROCS 的变量来决定，有多少个 OS thread 同时执行 Go 的代码。其默认的值是运行机器上的 CPU 的核心数。在一个有 8 个核心的机器上时，调度器一次会在 8 个 OS thread 上去调度 Go 代码。

:::tip 注意
* 在休眠中的或在通信中被阻塞的 goroutine 是不需要一个对应的 thread 来做调度的。
* 在 I/O 中或系统调用中或调用非 Go 语言函数时，是需要一个对应的 OS thread 的，但是 GOMAXPROCS 并不需要将这几种情况的线程数计算在内。
:::

可以用 GOMAXPROCS 的环境变量来显式地控制这个参数，也可以在运行时用 runtime.GOMAXPROCS 函数来修改它。这个程序会无限打印 0 和 1，待会会看到 GOMAXPROCS 的效果。

```go
for {
    go fmt.Print(0)
    fmt.Print(1)
}

$ GOMAXPROCS=1 go run .
111111111111111111110000000000000000000011111...

$ GOMAXPROCS=2 go run .
010101010101010101011001100101011010010100110...
```

第一次运行，最多同时只能有一个 goroutine 被执行。初始情况下只有 main goroutine 被执行，会打印很多 1。过了一段时间后，Go 调度器会将其置为休眠，并唤醒另一个 goroutine，这时候就开始打印很多 0 了。打印的时候，goroutine 是被调度到操作系统线程上的。

第二次运行，使用了两个 OS thread，所以两个 goroutine 可以一起被执行，以同样的频率交替打印 0 和 1。必须知道的是，goroutine 的调度是受很多因子影响的，而 runtime 也在不断地发展演进。可能会因为版本的不同而导致每个人运行的结果有所不同。

## goroutine 没有 ID 号

在大多数支持多线程的操作系统和程序语言中，当前的线程都有一个独特的身份（id），并且这个身份信息可以以一个普通值的形式被很容易地获取到，典型的可以是一个 integer 或者指针值。

goroutine 没有可以被程序员获取到的身份（id）的概念，本来就挺简单的语言，虽然可以通过某种手段获取到，最好别尝试去获取它！

## 参考

* [Go 语言程序设计——Goroutine 和线程](https://books.studygolang.com/gopl-zh/ch9/ch9-08.html)