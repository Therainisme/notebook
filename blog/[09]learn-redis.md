---
title: 尝试在不需要使用 Redis 的情景下使用上 Redis
authors: [Therainisme]
tags: [Redis]
date: 2022-5-4
---

Rt

<!--truncate-->

## 不管怎么说先先想办法 Run 起来

这对于 Docker 暴发户来说太简单啦，直接 pull 一个镜像 run 了，然后 exec redis-cli 连接进去。

```shell
docker run --name learn-redis -d redis
```

- `--name learn-redis`：让运行的容器改个名
- `-d`：让运行的容器以后台方式运行

```shell
docker exec -it learn-redis redis-cli
```

如果出现下面这个就代表连接进去了

```shell
127.0.0.1:6379>
```

## 场景一：在单体架构可以用 Map 的情况下但是我就要用 Redis

去年在多媒体部的小群里，有这么一个机器人。它可以通过你在群里的聊天消息，以你的身边向签到系统做出不同的操作：签到、签退。

这似乎只需要机器人将你的 QQ 号和你在签到系统中的唯一编号联系绑定就可以。现在有那么几种做法：

### 我过去愚昧的做法

在让群友以固定的形式发送绑定的消息，比如："绑定+192312313"。之后把 QQ 号和签到系统 ID 的联系储存在程序的 Map 。在服务器的某个位置，把这个 Map 写入一个文件。下次机器人更新或者机器人亡了需要重启服务器时，再将 Map 读到内存中。

这样也太蠢啦。内存中维护一份数据，磁盘上也维护一份数据。每次有群友绑定或改绑的时候，都会进行I/O操作更新磁盘文件。

虽然咱系统没那么大，但我觉得还是得优雅一点。

### 强行使用 Redis 的做法

redis 有持久化策略，会自动产生一个 dump.rdb 快照文件，重启时会从该文件导入数据。所以不必担心重启数据丢失的问题，也不必自己再编写一个存文件读文件的操作。可以光明正大的偷懒。

redis 还有一个 key expiration 的特性。你可以设置一个 key 什么时候过期。但一般来说 redis 中创建 key 的是不带 key expiration，如果你不使用类似 DEL 命令明确删除它，这个 key 将会一直存在。

但是有点绝对。一般情况是，当配置中选择开启了超出最大内存限制就写磁盘，这些没有设置过期时间的 key 可能会被写到磁盘上。假如没设置。redis 将使用 LRU 机制，将内存中的老数据删除，写入新数据。

可以使用 TTL 命令查看一个 key 的过期时间;

```
127.0.0.1:6379> ttl key
(integer) -1
```

如果不小心给一个 key 设置了过期时间，趁他没有过期之前赶紧让它持久化，否则它就 nil 了。

```
127.0.0.1:6379> set key value ex 5  # 过期时间 5s
OK
127.0.0.1:6379> persist key         # 持久化 key
(integer) 1                         # 如果 key 已经过期了这里会是 0
127.0.0.1:6379> get key             
"value"
```

接下来，改写之前那个愚昧的 Map 写法就变得超级简单了。群友不管绑定还是改绑了就无脑 set，不管从 QQ 获取 ID 还是 ID 获取 QQ 都无脑 get。~~redis 直接让我的大脑退化到小学时代，是牛是马都可以学编程~~。

## 场景二：利用 Redis 记录浏览量

[redis-strings](https://redis.io/docs/manual/data-types/data-types-tutorial/#strings)

这个 strings 不得了啊，它提供了 `INCR`、`INCRBY`、`DECR` 和 `DECRBY`，让你去对一个字符串自增或自减（它先将 string 转换成 int，再自增，后 set 新值）。而且 redis 的操作**都是原子性的，不会发生竞争关系**！

当时我看到这，~~孩子名字是什么我都想好了~~，这不是让我彻底爱上它吗？

剧本应该是这样的：

导演需要我记录科协论坛上某个贴子的浏览次数。如果一个用户在 5 小时之内重复浏览不能重复算，不然肯定会有老哥疯狂刷新。我说这非常好办啊！

当一个用户 `therainisme` 浏览帖子 `520` 时：

```
127.0.0.1:6379> incr post:520                                      # 自增，如果不存在 redis 会自动创建后再自增
127.0.0.1:6379> set post:520:visitor:therainisme look ex 18000     # 设置一个过期时间为 18000s 的 key
```

如果再 5 小时之内 `therainisme` 再次浏览帖子 `520` 时，先 get 一下：

```
127.0.0.1:6379> get post:520:visitor:therainisme
"look"  # 这不是 (nil) 证明这家伙 5h 之内浏览过了
```

如果超过 5 小时没浏览过应该是这样的，反手再给它一个 18000 秒的 key

```
127.0.0.1:6379> get post:520:visitor:therainisme
(nil)
127.0.0.1:6379> set post:520:visitor:therainisme look ex 18000
```

如果数据量真的非常大了，有需要将数据写到 MySQL 的需求。实在没办法，只能在 set post:520 时设置一个比较长的过期时间，趁大火都熟睡时，将 redis 中的 post:520 写入 MySQL。如果这个贴子很久没浏览了 post:520 会自动过期。很久之后被挖坟了， redis 读不到，就从 MySQL 读到 redis 里。

最后来叠个 buff：毕竟咱也是没有进过厂的人，剧本可能错误

## 场景三：性感荷官在线发牌

~~写不动了。现在 23:20 分，得赶紧润回宿舍了。~~