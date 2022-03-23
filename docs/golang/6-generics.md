# 泛型

:::tip 注意
Go 1.18 已发布
:::

## example

```go
type Number interface {
	int64 | float64
}

func Add[T Number](a, b T) T {
	return a + b
}

func main() {
	fmt.Printf("%v", Add[int64](1, 2))
}
```