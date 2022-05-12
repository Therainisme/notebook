# 关于 map

### 如果仅仅只是声明一个 map，能不能直接用呢？

```go
func main() {
	var m map[int]int

	m[1] = 1 // panic: assignment to entry in nil map
}
```

:::tip RES
肯定不行啊，不然留着 make 函数过年吗？
:::

### map 线程安全吗？

```go
func main() {
	var m map[int]int = make(map[int]int)

	var wg sync.WaitGroup
	wg.Add(200)

	for i := 0; i < 10000; i++ {
		go func() {
			m[1] = 1
			wg.Done()
		}()
	}

	for i := 0; i < 10000; i++ {
		go func() {
			m[1] = 1
			wg.Done()
		}()
	}

	wg.Wait()

    // fatal error: concurrent map writes
}
```

:::tip RES
反正不能并发写，并发读是可以的。
:::