# flag.Value

为自定义数据类型定义新的标记符号，只需要实现 `flag.Value` 接口。`String` 方法格式化标记的值用在命令行帮助消息中，因为实现了 `String` 方法，所以每一个 `flag.Value` 也是一个 `fmt.Stringer`。

```go
package flag

type Value interface {
    String() string
    Set(string) error
}
```

没有需求创造需求。假设有一个自定义类型 `Ren`，接收学号。然后输出班级和班级。例如 `"1900300101" => "19级001班"`。 

```go
type renFlag struct {
	v int
}

func (r *renFlag) Set(s string) error {
	if len(s) != 10 {
		return fmt.Errorf("student id length != 10")
	}

	v, err := strconv.Atoi(s)
	if err != nil {
		return err
	}
	r.v = v

	return nil
}

func (r *renFlag) String() string {
	return fmt.Sprintf("%d级%d班", r.v/100000000, r.v%100000/100)
}
```

通过 `flag.CommandLine.Var` 传递给 flag 包。

```go
func RenFlag(name string, value int, usage string) *renFlag {
	f := renFlag{value}

    // 注意这里必须传递的是地址
	flag.CommandLine.Var(&f, name, usage)
	return &f
}
```

接着就可以愉快的使用了

```go
var ren = RenFlag("stid", 1900300101, "the student id")

func main() {
	flag.Parse()
	fmt.Println(ren)
}
```