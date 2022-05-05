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

### 过去我愚昧的做法

在让群友以固定的形式发送绑定的消息，比如："绑定+192312313"。之后把 QQ 号和签到系统 ID 的联系储存在程序的 Map 。在服务器的某个位置，把这个 Map 写入一个文件。下次机器人更新或者机器人亡了需要重启服务器时，再将 Map 读到内存中。

这样也太蠢啦。内存中维护一份数据，磁盘上也维护一份数据。每次有群友绑定或改绑的时候，都会进行I/O操作更新磁盘文件。

虽然咱系统没那么大，但我觉得还是得优雅一点。

### 强行使用 Redis 的做法

redis 有持久化策略，会自动产生一个 dump.rdb 快照文件，重启时会从该文件导入数据。所以不必担心重启数据丢失的问题，也不必自己再编写一个存文件读文件的操作。可以光明正大的偷懒。

redis 还有一个 key expiration 的特性。你可以设置一个 key 什么时候过期。但一般来说 redis 中创建 key 的是不带 key expiration，如果你不使用类似 DEL 命令明确删除它，这个 key 将会一直存在。

但是有点绝对。一般情况是，当配置中选择开启了超出最大内存限制就写磁盘，这些没有设置过期时间的 key 可能会被写到磁盘上。假如没设置。redis 将使用 LRU 机制，将内存中的老数据删除，写入新数据。

可以使用 TTL 命令查看一个 key 的过期时间：

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

最后来叠个 buff：毕竟咱没进过厂，剧本可能有误

## 场景三：性感荷官在线发牌

> 这也是 redis manual 中的一个例子

redis 里有一个集合 [set](https://redis.io/docs/manual/data-types/data-types-tutorial/#sets)。

集合可以作为斗地主的牌库，先定义一下牌的形式：`X` `M` `H` `B`，分别对应方块、梅花、红桃、黑桃。`3`、`4`、`5`、`6`、`7`、`8`、`9`、`0`、`J`、`Q`、`K`、`A`、`2` 这些作为点数。例如红桃2为：`H2`。嗯......大王和小王就是 `KG` 和 `KM` 吧。（我瞎起的）

```
127.0.0.1:6379> sadd deck X3 X4 X5 X6 X7 X8 X9 X0 XJ XQ XK XA X2
(integer) 13
127.0.0.1:6379> sadd deck M3 M4 M5 M6 M7 M8 M9 M0 MJ MQ MK MA M2
(integer) 13
127.0.0.1:6379> sadd deck H3 H4 H5 H6 H7 H8 H9 H0 HJ HQ HK HA H2
(integer) 13
127.0.0.1:6379> sadd deck B3 B4 B5 B6 B7 B8 B9 B0 BJ BQ BK BA B2
(integer) 13
127.0.0.1:6379> sadd deck KB KM
(integer) 2
```

smembers 查看一下，如果是 54 张牌就对了 

```
127.0.0.1:6379> smembers deck
 1) "M9"
 2) "B4"
......
53) "H2"
54) "MA"
```

假如现在房间 250 正在斗地主，他们可不想打完这把之后还要执行 sadd deck，请务必对牌库使用 sunionstore 复制一份。

```
127.0.0.1:6379> sunionstore room:250:deck deck # 将 deck 以及后面的集合并集，结果存入 room:250:deck 中
(integer) 54
```

set 这玩意是无序的，荷官在发牌时，先随机从牌堆里明示一张牌，分到这张牌的玩家拥有第一个叫地主的权力。srandmember 可以随机查看 set 中的一个元素且不会移除。

```
127.0.0.1:6379> srandmember room:250:deck
"BQ"
```

再用 spop 抽出 3 张地主牌，再给三个玩家轮流 spop 17 次。

```
127.0.0.1:6379> spop room:250:deck 3  # spop 3 张牌，且这 3 张牌从 room:250:deck 移除了
1) "HK"
2) "BK"
3) "B4"

127.0.0.1:6379> spop room:250:deck 17  # spop 17 张牌
127.0.0.1:6379> spop room:250:deck 17  # spop 17 张牌
127.0.0.1:6379> spop room:250:deck 17  # spop 17 张牌
```

## 场景四：卷王与摆王

科协有一个自己的签到系统，当时的啪一下，扫整个 MySQL 表，非常的快啊。

```sql
SELECT r.user_id "学号",
       u.name "姓名",
       convert(r.total_time / 1000 / 60 / 60, decimal(10, 2)) "在线时长",
       if (u.location=5109, '你的椅子本来就很舒服', '恭喜你呀') "老板椅使用权"
FROM attendance_rank r
         LEFT JOIN user u ON u.id = r.user_id
WHERE r.week = 8
  and r.user_id > 2100000000 or r.user_id=2000301820
ORDER BY r.total_time DESC;
```

不对不对，剧本不对。现在要学会使用 redis 脱裤子放屁。redis 有一个 [sorted sets](https://redis.io/docs/manual/data-types/data-types-tutorial/#sorted-sets)。它可以放一个 `<score, value>` 进去，根据 `score` 排序，内部使用 hash table 和 skip list 实现。外表长得完全跟 C++ 的 set 一个样。


```
127.0.0.1:6379> zadd rank 52 a 51 b 48 c 47 d 45 e   # 5 个人
127.0.0.1:6379> zadd rank 30 f 31 g 32 h 33 i 34 j   # 5 个人
127.0.0.1:6379> zadd rank 17 k 18 l 19 m 20 n 20 o   # 5 个人
```

查看排名后五的摆王

```
127.0.0.1:6379> zrange rank 0 5
1) "k"
2) "l"
3) "m"
4) "n"
5) "o"
6) "f"
```

查看排名前五的卷王

```
127.0.0.1:6379> zrevrange rank 0 5
1) "a"
2) "b"
3) "c"
4) "d"
5) "e"
6) "j"
```

看看哪个小伙子没有达到 18 个小时嘿嘿，带上了 withscores 参数，会一同显示 key 对应的 score

```
127.0.0.1:6379> zrangebyscore rank 0 17 withscores
1) "k"
2) "17"
```

## 场景五：记录一天之内有多少个用户访问了网站

这个场景和场景二很像，但它并不需要设置过期时间。如果使用 redis 的 [bitmap](https://redis.io/docs/manual/data-types/data-types-tutorial/#bitmaps)，能记录的数据有 2^32 条，即能用 512MB 的大小记录最多 4294967296 个用户是否访问。

~~emmmm 用 set 也能做到，而且还没有大小限制~~。bitmap 是基于 string，只能存正整数，有大小限制。如果用户 ID 是花里胡哨的 uuid 、负数或者是其他的，甚至有超过 42 亿的用户量的系统，老老实实用 set 吧。

例如现在有用户 25014、194250 今天 2022-5-5 访问了网站。

```
127.0.0.1:6379> setbit 2022-5-5 25014 1
(integer) 0  # 返回的是添加前的状态
127.0.0.1:6379> setbit 2022-5-5 194250 1
(integer) 0  # 返回的是添加前的状态
```

夜深了，管理员查看今天有多少用户访问了网站。

```
127.0.0.1:6379> bitcount 2022-5-5
(integer) 2
```

才两个，有点凄惨......

其实用 [HyperLogLog](https://redis.io/docs/manual/data-types/data-types-tutorial/#hyperloglogs) 也能做到这件事，能用 12KB 的内存计算接近 2
^64 个不同元素的基数，唯一的代价是最多有 1% 的误差。

管他呢，40 亿和 40.01 亿都相当于 40 亿。HyperLogLog 一把梭！

```
127.0.0.1:6379> pfadd 2022-5-5 25014
(integer) 1
127.0.0.1:6379> pfadd 2022-5-5 194250
(integer) 1
```

夜深了，管理员查看今天 有多少用户访问了网站，欸？！他终究还是等不到那 1%。

```
127.0.0.1:6379> pfcount 2022-5-5
(integer) 2
```

## 场景六：当 MySQL 用

话是这么说，但只能缓存一个表中的一行记录。一般是用来存某个名人的数据。

现在有一个用户访问量特别大，需要适当缓解一下 MySQL 的压力。

用户 ID：250、Name：therainisme、Age：17、发帖量：100、点赞量：666。

```
127.0.0.1:6379> hmset user:250 name therainisme age 17 post:count 100 star:count 666
OK
```

如果有用户访问了他的主页

```
127.0.0.1:6379> hgetall user:250
1) "name"
2) "therainisme"
3) "age"
4) "17"
5) "post:count"
6) "100"
7) "star:count"
8) "666"
```

如果只是想看看他的点赞量

```
127.0.0.1:6379> hget user:250 star:count
"666"
```

如果被点赞了，让他的点赞量 + 1（这个和 string 的差不多，string：incrby，hashes：hincrby）

```
127.0.0.1:6379> hincrby user:250 star:count 1
(integer) 667
```

然后夜深人静的时候悄悄地把它写进 MySQL。