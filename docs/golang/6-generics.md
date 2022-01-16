# 泛型

:::tip 注意
以下为 Go 1.18 beta 版本内容
:::

[https://golang.google.cn/doc/tutorial/generics](https://golang.google.cn/doc/tutorial/generics)

## 安装和使用 Go 的 beta 版本

1. 运行以下命令安装 beta 版本

```shell
go install golang.org/dl/go1.18beta1@latest
```

2. 运行以下命令进行更新

```shell
go1.18beta1 download
```

3. 查看版本

```shell
go1.18beta1 version
```

## 编写代码

### 约束类型

先声明了一个 `Number` 接口来作为一个类型约束，通过这种方式，当你想要约束一个类型形参为 `int64` 类型或 `float64` 类型时，你可以使用 `Number` 约束，而不是直接写出 `int64 | float64`。

```go
type Number interface {
    int64 | float64
}
```

### 泛型函数

每一个 `map` 调用了 `SumNumbers` 函数，都返回它们的 `value` 之和。

```go
func SumIntsOrFloats[K comparable, V Number](m map[K]V) V {
	var s V
	for _, v := range m {
		s += v
	}
	return s
}
```

### 运行

主函数代码：
```go
func main() {
	ints := map[string]int64{
		"first":  34,
		"second": 12,
	}

	floats := map[string]float64{
		"first":  35.98,
		"second": 26.99,
	}

	fmt.Printf("Generic Sums: %v and %v\n",
		SumIntsOrFloats[string, int64](ints),    
		SumIntsOrFloats[string, float64](floats), 
	)

    // 这样写也可以
    // fmt.Printf("Generic Sums: %v and %v\n",
	// 	SumIntsOrFloats(ints),    
	// 	SumIntsOrFloats(floats), 
	// )
}
```

在命令行中输入：
```shell
go1.18beta1 run .
```

运行结果：

```
Generic Sums: 46 and 62.97
```

### 完整代码

```go
package main

import "fmt"

type Number interface {
	int64 | float64
}

func SumIntsOrFloats[K comparable, V Number](m map[K]V) V {
	var s V
	for _, v := range m {
		s += v
	}
	return s
}

func main() {
	ints := map[string]int64{
		"first":  34,
		"second": 12,
	}

	floats := map[string]float64{
		"first":  35.98,
		"second": 26.99,
	}

	fmt.Printf("Generic Sums: %v and %v\n",
		SumIntsOrFloats[string, int64](ints),
		SumIntsOrFloats[string, float64](floats),
	)
}
```