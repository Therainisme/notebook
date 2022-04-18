---
title: 字符串哈希
authors: [Therainisme]
tags: [Algorithm]
---

全称字符串前缀哈希法，把字符串变成一个 p 进制数字（哈希值），实现不同的字符串映射到不同的数字。
对形如 $X_{1}X_{2} ... X_{n}$ 的字符串,采用字符的 ASCII 码乘上 $P$ 的次方来计算哈希值。

<!--truncate-->

$$
(X_{1} \times P^{n-1} X_{2} \times P^{n−2} + ⋯ + X_{n−1} \times P^1 + X_n \times P^0) \mod Q
$$

注意：
1. 任意字符不可以映射成 0，否则会出现不同的字符串都映射成 0 的情况，比如 A, AA, AAA 皆为 0
2. 冲突问题：设置 $P$ ($131$ 或 $13331$) , $Q$ ($2^{64}$)的值，99.99% 的情况下不会冲突。

### 前缀区间和

ABCDE 与 ABC 的前三个字符值是一样，只差两位。

乘上 $P^2$ 把 ABC 变为 ABC00，再用 ABCDE - ABC00 得到 DE 的哈希值。

### 重要公式

* 前缀和递推公式

$$
h[i+1] = h[i] \times P + s[i] 
$$

* 区间和公式

$$
h[l, r] = h[r] - h[l-1] \times P^{r - l + 1}
$$

:::tip 注意
h 是前缀和数组，s 是字符串数组。
:::

### 例题

[ACWing-字符串哈希](https://www.acwing.com/problem/content/843/)

用一个数组将 $P$ 的 $n$ 次幂存储下来。

当 $Q$ 是 $2^{64}$ 时，使用 unsigned long long 表示哈希值，它的范围是 $[0,2^{64}-1]$，如果溢出了它会自动取模。