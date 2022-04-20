---
title: 关于 0x3f3f3f3f 与 memset(a, 0x3f, sizeof a)
authors: [Therainisme]
tags: [Algorithm]
date: 2022-2-18
---

在算法题中，一般无穷大常量取值可以是 0x3f3f3f3f。

<!--truncate-->

## 0x3f3f3f3f

0x3f3f3f3f 的十进制是 1061109567，它是 10^9 级别的数。

它大于 10^9。一般场合下数据都是小于 10^9 的。所以如果数据范围在 -10^9 ~ 10^9 之间，可以使用这个常量。

如果 0x3f3f3f + 0x3f3f3f3f = 0x7e7e7e7e（2122219134），结果非常大但却没有超过 32bit int 的表示范围，所以0x3f3f3f3f 还满足了“无穷大加无穷大还是无穷大”的需求。

可以使用 `memset(a, 0x3f, sizeof a)` 将数组中所有数置为 0x3f3f3f3f。

## memset(a, 0x3f, sizeof a)

memset 函数是内存赋值函数，用来给某一块内存空间进行赋值。

memset 按**字节**赋值。

在 C++ 中一个 int 是 4 字节，如果 `i` 是 int 变量的地址，`memset(i, 0x3f, sizeof i)` 意味着给 `i` 变量的内存空间赋值为 0x3f3f3f3f。

所以说将一个数组全部置为 0x3f3f3f3f 可以使用 `memset(a, 0x3f, sizeof a)`。

相似的，因为 -1 的二进制表示 1111... 32 个 1 组成，所以可以使用 `memset(a, -1, sizeof a)` 将数组全部置为 -1。

相似的还有 `memset(a, 0, sizeof a)` 将数组全部置为 0。