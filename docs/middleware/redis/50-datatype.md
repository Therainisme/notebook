# DataType

## Keys

- Very long keys are not a good idea. 
- Very short keys are often not a good idea. （"u1000flw" >> "user:1000:followers"）
- For instance "object-type:id" is a good idea, as in "user:1000". Dots or dashes are often used for multi-word fields, as in `"comment:1234:reply.to"` or `"comment:1234:reply-to"`.
- The maximum allowed key size is 512 MB

## Strings

`SET` will replace any existing value already stored into the key, in the case that the key already exists, even if the key is associated with a non-string value. 

A value can't be bigger than 512 MB.

For example, I may ask `SET` to fail if the key already exists, or the opposite, that it only succeed if the key already exists:

```
> set mykey newval nx
(nil)
> set mykey newval xx
OK
```

Even if strings are the basic values of Redis, there are interesting operations you can perform with them. For instance, one is atomic increment:

```
> set counter 100
OK
> incr counter
(integer) 101
> incr counter
(integer) 102
> incrby counter 50
(integer) 152
```

The `INCR` command parses the string value as an integer, increments it by one, and finally sets the obtained value as the new value. That even multiple clients issuing `INCR` against the same key will never enter into a race condition.

The `GETSET` command sets a key to a new value, returning the old value as the result.

The ability to set or retrieve the value of multiple keys in a single command is also useful for reduced latency. For this reason there are the `MSET` and `MGET` commands:

```
> mset a 10 b 20 c 30
OK
> mget a b c
1) "10"
2) "20"
3) "30"
```

When `MGET` is used, Redis returns an array of values.

## Altering and querying the key space

The `EXISTS` command returns 1 or 0 to signal if a given key exists or not in the database.

The `DEL` command deletes a key and associated value, whatever the value is.

```
> set mykey hello
OK
> exists mykey
(integer) 1
> del mykey
(integer) 1
> exists mykey
(integer) 0
```

From the examples you can also see how `DEL` itself returns 1 or 0 depending on whether the key was removed (it existed) or not (there was no such key with that name).

The `TYPE` command returns the **kind of value** stored at the specified key:

```
> set mykey x
OK
> type mykey
string
> del mykey
(integer) 1
> type mykey
none
```

## Key expiration

Key expiration lets you set a timeout for a key, also known as a "time to live", or "TTL". When the time to live elapses, the key is automatically destroyed.

- They can be set both using seconds or milliseconds precision.
- However the expire time resolution is always 1 millisecond.
- **Information about expires are replicated and persisted on disk**, the time virtually passes when your Redis server remains stopped (this means that Redis saves the date at which a key will expire).

Use the `EXPIRE` command to set a key's expiration:

```
> set key some-value
OK
> expire key 5
(integer) 1
> get key (immediately)
"some-value"
> get key (after some time)
(nil)
```

We used `EXPIRE` in order to set the expire. `PERSIST` can be used in order to remove the expire and make the key persistent forever.

However we can also create keys with expires using other Redis commands. For example using `SET` options:

```
> set key 100 ex 10
OK
> ttl key
(integer) 9
```

The `TTL` command is called in order to check the remaining time to live for the key.

## Lists

Redis lists are implemented via Linked Lists. This means that even if you have millions of elements inside a list, the operation of adding a new element in the head or in the tail of the list is performed in constant time.

### First steps with Redis Lists

The `LPUSH` command adds a new element into a list, on the left (at the head), while the `RPUSH` command adds a new element into a list, on the right (at the tail). Finally the `LRANGE` command extracts ranges of elements from lists:

```
> rpush mylist A
(integer) 1
> rpush mylist B
(integer) 2
> lpush mylist first
(integer) 3
> lrange mylist 0 -1
1) "first"
2) "A"
3) "B"
```

Note that `LRANGE` takes two indexes, the first and the last element of the range to return. Both the indexes can be negative, telling Redis to start counting from the end: so -1 is the last element, -2 is the penultimate element of the list, and so forth.

Both commands are variadic commands, meaning that you are free to push multiple elements into a list in a single call:

```
> rpush mylist 1 2 3 4 5 "foo bar"
(integer) 9
> lrange mylist 0 -1
1) "first"
2) "A"
3) "B"
4) "1"
5) "2"
6) "3"
7) "4"
8) "5"
9) "foo bar"
```

You can pop elements from left and right, similarly to how you can push elements in both sides of the list:

```
> rpush mylist a b c
(integer) 3
> rpop mylist
"c"
> rpop mylist
"b"
> rpop mylist
"a"
> rpop mylist
(nil)
```

### Common use cases for lists

- Remember the latest updates posted by users into a social network.
- Communication between processes, using a consumer-producer pattern where the producer pushes items into a list, and a consumer (usually a worker) consumes those items and executed actions. Redis has special list commands to make this use case both more reliable and efficient.

To describe a common use case step by step, imagine your home page shows the latest photos published in a photo sharing social network and you want to speedup access.

- Every time a user posts a new photo, we add its ID into a list with `LPUSH`.
- When users visit the home page, we use LRANGE 0 9 in order to get the latest 10 posted items.

### Capped lists

Redis allows us to use lists as a capped collection, only remembering the latest N items and discarding all the oldest items using the `LTRIM` command.

The `LTRIM` command is similar to LRANGE, but instead of displaying the specified range of elements it sets this range as the new list value. **All the elements outside the given range are removed.**

```
> rpush mylist 1 2 3 4 5
(integer) 5
> ltrim mylist 0 2
OK
> lrange mylist 0 -1
1) "1"
2) "2"
3) "3"
```

## Blocking operations on lists

`BRPOP` and `BLPOP` are versions of `RPOP` and `LPOP` **able to block** if the list is empty: they'll return to the caller only when a new element is added to the list, or when a user-specified timeout is reached.

```
> brpop tasks 5
1) "tasks"
2) "do_something"
```

It means: "wait for elements in the list tasks, but return if after 5 seconds no element is available".

Note that you can use 0 as timeout to wait for elements forever, and you can also specify multiple lists and not just one, in order to wait on multiple lists at the same time, and get notified when the first list receives an element.

A few things to note about `BRPOP`:
- Clients are served in an ordered way: the first client that blocked waiting for a list, is served first when an element is pushed by some other client, and so forth.
- The return value is different compared to RPOP: it is a two-element array since it also includes the name of the key, because BRPOP and BLPOP are able to block waiting for elements from multiple lists.
- If the timeout is reached, NULL is returned.

There are more things you should know about lists and blocking ops. We suggest that you read more on the following:
- It is possible to build safer queues or rotating queues using `LMOVE`.
- There is also a blocking variant of the command, called `BLMOVE`.

## Automatic creation and removal of keys

This is not specific to lists, it applies to all the Redis data types composed of multiple elements -- Streams, Sets, Sorted Sets and Hashes.

- When we add an element to an aggregate data type, if the target key does not exist, an empty aggregate data type is created before adding the element.
- When we remove elements from an aggregate data type, if the value remains empty, the key is automatically destroyed. The Stream data type is the only exception to this rule.
- Calling a read-only command such as `LLEN` (which returns the length of the list), or a write command removing elements, with an empty key, always produces the same result as if the key is holding an empty aggregate type of the type the command expects to find.

Rule 1:

```
> del mylist
(integer) 1
> lpush mylist 1 2 3
(integer) 3
```

However we can't perform operations against the wrong type if the key exists:

```
> set foo bar
OK
> lpush foo 1 2 3
(error) WRONGTYPE Operation against a key holding the wrong kind of value
> type foo
string
```

Rule 2:

```
> lpush mylist 1 2 3
(integer) 3
> exists mylist
(integer) 1
> lpop mylist
"3"
> lpop mylist
"2"
> lpop mylist
"1"
> exists mylist
(integer) 0
```

Rule 3:

```
> del mylist
(integer) 0
> llen mylist
(integer) 0
> lpop mylist
(nil)
```

## Hashes

```
> hmset user:1000 username antirez birthyear 1977 verified 1
OK
> hget user:1000 username
"antirez"
> hget user:1000 birthyear
"1977"
> hgetall user:1000
1) "username"
2) "antirez"
3) "birthyear"
4) "1977"
5) "verified"
6) "1"
```

The command `HMSET` sets multiple fields of the hash, while `HGET` retrieves a single field. `HMGET` is similar to `HGET` but returns an array of values:

```
> hmget user:1000 username birthyear no-such-field
1) "antirez"
2) "1977"
3) (nil)
```

There are commands that are able to perform operations on individual fields as well, like `HINCRBY`:

```
> hincrby user:1000 birthyear 10
(integer) 1987
> hincrby user:1000 birthyear 10
(integer) 1997
```

## Sets

Redis Sets are **unordered** collections of strings. The `SADD` command adds new elements to a set. Redis is free to return the elements in any order at every call, since there is no contract with the user about element ordering.

```
> sadd myset 1 2 3
(integer) 3
> smembers myset
1. 3
2. 1
3. 2
```

Redis has commands to test for membership. For example, checking if an element exists:

```
> sismember myset 3
(integer) 1
> sismember myset 30
(integer) 0
```

We using the `SINTER` command, which performs the intersection between different sets.

```
using the SINTER command, which performs the intersection between different sets.
```

In addition to intersection you can also perform unions, difference, extract a random element, and so forth.

We use `SUNIONSTORE`, which normally performs the union between multiple sets, and stores the result into another set. However, since the union ingle set is itself, I can copy my deck with:

```
> sunionstore game:1:deck deck
(integer) 52
```

This is a good time to introduce the set command that provides the number of elements inside a set. This is often called the cardinality of a set in the context of set theory, so the Redis command is called `SCARD`.

```
> scard game:1:deck
(integer) 47
```

When you need to just get random elements without removing them from the set, there is the `SRANDMEMBER` command suitable for the task. It also features the ability to return both repeating and non-repeating elements.


## Sorted sets

However while elements inside sets are not ordered, every element in a sorted set is associated with a floating point value, called the score (this is why the type is also similar to a hash, since every element is mapped to a value).

They are ordered according to the following rule:
- If A and B are two elements with a different score, then A > B if A.score is > B.score.
- If A and B have exactly the same score, then A > B if the A string is lexicographically greater than the B string. A and B strings can't be equal since sorted sets only have unique elements.

Let's start with a simple example, adding a few selected hackers names as sorted set elements, **with their year of birth as "score"**.

```
> zadd hackers 1940 "Alan Kay"
(integer) 1
> zadd hackers 1957 "Sophie Wilson"
(integer) 1
> zadd hackers 1953 "Richard Stallman"
(integer) 1
> zadd hackers 1949 "Anita Borg"
(integer) 1
> zadd hackers 1965 "Yukihiro Matsumoto"
(integer) 1
> zadd hackers 1914 "Hedy Lamarr"
(integer) 1
> zadd hackers 1916 "Claude Shannon"
(integer) 1
> zadd hackers 1969 "Linus Torvalds"
(integer) 1
> zadd hackers 1912 "Alan Turing"
(integer) 1
```

As you can see `ZADD` is similar to `SADD`, but takes one additional argument (placed before the element to be added) which is the score. `ZADD` is also variadic, so you are free to specify multiple score-value pairs, even if this is not used in the example above.

Implementation note: Sorted sets are implemented via a dual-ported data structure containing both **a skip list** and **a hash table**, so every time we add an element Redis performs an O(log(N)) operation. That's good, but when we ask for sorted elements Redis does not have to do any work at all, it's already all sorted:

```
> zrange hackers 0 -1
1) "Alan Turing"
2) "Hedy Lamarr"
3) "Claude Shannon"
4) "Alan Kay"
5) "Anita Borg"
6) "Richard Stallman"
7) "Sophie Wilson"
8) "Yukihiro Matsumoto"
9) "Linus Torvalds"
```

What if I want to order them the opposite way, youngest to oldest? Use `ZREVRANGE` instead of `ZRANGE`:

```
> zrevrange hackers 0 -1
1) "Linus Torvalds"
2) "Yukihiro Matsumoto"
3) "Sophie Wilson"
4) "Richard Stallman"
5) "Anita Borg"
6) "Alan Kay"
7) "Claude Shannon"
8) "Hedy Lamarr"
9) "Alan Turing"
```

It is possible to return scores as well, using the `WITHSCORES` argument:

```
> zrange hackers 0 -1 withscores
1) "Alan Turing"
2) "1912"
3) "Hedy Lamarr"
4) "1914"
5) "Claude Shannon"
6) "1916"
7) "Alan Kay"
8) "1940"
9) "Anita Borg"
10) "1949"
11) "Richard Stallman"
12) "1953"
13) "Sophie Wilson"
14) "1957"
15) "Yukihiro Matsumoto"
16) "1965"
17) "Linus Torvalds"
18) "1969"
```

### Operating on ranges

Let's get all the individuals that were born up to 1950 inclusive. We use the `ZRANGEBYSCORE` command to do it:

```
> zrangebyscore hackers -inf 1950
1) "Alan Turing"
2) "Hedy Lamarr"
3) "Claude Shannon"
4) "Alan Kay"
5) "Anita Borg"
```

It's also possible to remove ranges of elements. Let's remove all the hackers born between 1940 and 1960 from the sorted set:

```
> zremrangebyscore hackers 1940 1960
(integer) 4
```

`ZREMRANGEBYSCORE` is perhaps not the best command name, but it can be very useful, and returns the number of removed elements.

Another extremely useful operation defined for sorted set elements is the get-rank operation. It is possible to ask what is the position of an element in the set of the ordered elements.

```
> zrank hackers "Anita Borg"
(integer) 4
```

The `ZREVRANK` command is also available in order to get the rank, considering the elements sorted a descending way.

### Lexicographical scores

The main commands to operate with lexicographical ranges are `ZRANGEBYLEX`, `ZREVRANGEBYLEX`, `ZREMRANGEBYLEX` and `ZLEXCOUNT`.

For example, let's add again our list of famous hackers, but this time use a score of zero for all the elements:

```
> zadd hackers 0 "Alan Kay" 0 "Sophie Wilson" 0 "Richard Stallman" 0
  "Anita Borg" 0 "Yukihiro Matsumoto" 0 "Hedy Lamarr" 0 "Claude Shannon"
  0 "Linus Torvalds" 0 "Alan Turing"
```

Because of the sorted sets ordering rules, they are already sorted lexicographically:

```
> zrange hackers 0 -1
1) "Alan Kay"
2) "Alan Turing"
3) "Anita Borg"
4) "Claude Shannon"
5) "Hedy Lamarr"
6) "Linus Torvalds"
7) "Richard Stallman"
8) "Sophie Wilson"
9) "Yukihiro Matsumoto"
```

Using `ZRANGEBYLEX` we can ask for lexicographical ranges:

```
> zrangebylex hackers [B [P
1) "Claude Shannon"
2) "Hedy Lamarr"
3) "Linus Torvalds"
```

## Updating the score: leader boards

Just a final note about sorted sets before switching to the next topic. Sorted sets' scores can be updated at any time. Just calling ZADD against an element already included in the sorted set will update its score (and position) with O(log(N)) time complexity. **As such, sorted sets are suitable when there are tons of updates.**

Because of this characteristic a common use case is leader boards. The typical application is a Facebook game where you combine the ability to take users sorted by their high score, plus the get-rank operation, in order to show the top-N users, and the user rank in the leader board (e.g., "you are the #4932 best score here").

## Bitmaps

Bitmaps are not an actual data type, but a set of bit-oriented operations defined on the String type. Since strings are binary safe blobs and their maximum length is 512 MB, they are suitable to set up to 2^32 different bits.

Bits are set and retrieved using the `SETBIT` and `GETBIT` commands:

```
> setbit key 10 1
(integer) 1
> getbit key 10
(integer) 1
> getbit key 11
(integer) 0
```

The `SETBIT` command takes as its first argument the bit number, and as its second argument the value to set the bit to, which is 1 or 0. **The command automatically enlarges the string if the addressed bit is outside the current string length.**

`GETBIT` just returns the value of the bit at the specified index. **Out of range bits (addressing a bit that is outside the length of the string stored into the target key) are always considered to be zero.**

There are three commands operating on group of bits:
- `BITOP` performs bit-wise operations between different strings. The provided operations are AND, OR, XOR and NOT.
- `BITCOUNT` performs population counting, reporting the number of bits set to 1.
- `BITPOS` finds the first bit having the specified value of 0 or 1.

## HyperLogLogs

- Every time you see a new element, you add it to the count with `PFADD`.
- Every time you want to retrieve the current approximation of the unique elements added with `PFADD` so far, you use the `PFCOUNT`.

```
> pfadd hll a b c d
(integer) 1
> pfcount hll
(integer) 4
```