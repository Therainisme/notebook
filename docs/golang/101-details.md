# 其他

### 变量

`struct{}` 和 `[]int` 类型的大小是 0，他们有可能有相同的地址

对于在**包一级声明的变量**来说，他们的声明周期和整个程序的运行周期是一致的。**局部变量**的声明周期是动态的，每次从创建一个新变量的声明语句开始，直到该变量不再被引用为止。然后局部变量的存储空间才可能被回收。函数的参数和返回值都是局部变量，它们在函数每次被调用的时候创建。

### GC

Go 语言的自动垃圾收集器基本实现思路：从每个包级的变量和每个当前运行函数的每一个局部变量开始，通过指针或引用的访问路径遍历，是否可以找到该变量。如果不存在这样的访问路径，说明变量不可达，代表它的存在不会影响程序后续的计算结果。编译器会自动选择在栈上还是在堆上分配局部变量的储存空间，而且不由 `var` 或 `new` 声明变量的方式决定。

虽然 Go 的垃圾回收机制不会回收不被使用的内存，但是这不包括操作系统层面的资源，比如打开文件、网络连接，因此必须显示的释放这些资源。

### 元组赋值

```go
a, b = b, a
```

在赋值之前，赋值语句右边的所有表达式将会先进行求值，然后再统一更新左边对应变量的值。

### 包的初始化

包的初始化首先是解决包级变量的依赖顺序，然后按照包级变量声明出现的顺序一次初始化

```go
var a = b + c // a 第三个初始化, 为 3
var b = f()   // b 第二个初始化, 为 2, 通过调用 f (依赖c)
var c = 1     // c 第一个初始化, 为 1

func f() int { return c + 1 }
```

如果包中含有多个.go源文件，它们将**按照发给编译器的顺序**进行初始化。Go语言的构建工具首先**会将.go文件根据文件名排序**然后**依次调用编译器编译**。

某些表格数据初始化并不是一个简单的赋值过程，在这种情况下，可以使用 init 初始化函数简化初始化工作，每个文件都可以包含多个 init 初始化函数。

```go
func init() { /* ... */}
func init() { /* ... */}
func init() { /* ... */}
```

每个包在解决依赖的前提下，以导入声明的顺序初始化，**每个包只会被初始化一次**。如果一个 b 包导入了 a，那么在 b 包初始化的时候可以认为 a 包必然已经初始化过了。初始化工作是自下而上进行的，main 包最后才被初始化。以这种方式，可以确保 main 函数执行之前，所有依赖的包都已经完成初始化的工作了。  

### 作用域

当编译器遇到一个名字引用时，它会对其定义进行查找，查找过程从最内层的词法域向全局的作用域进行。
* 如果查找失败，则报告“未声明的名字”这样的错误。
* 如果该名字在内部和外部的块分别声明过，则内部的块声明首先被找到。（在这种情况下，内部的声明屏蔽了外部的声明，让外部的声明无法被访问）

### 运算

在 Go 语言中，% 取模的运算符的符号**和被取模数的符号总是一致**的，因此 -5%3 和 -5%-3 结果都是 -2。

除法运算符 / 的结果依赖于操作数是否全为整数。5.0/4.0 的结果是 1.25，但是 5/4 的结果是 1。

运算的结果，如果需要更多 bit 位才能正确表示的话，就说明计算结果是移除了。超出的高位的bit位部分将被丢弃。如果原始的数值是有符号类型，而且最左边的bit位是1的话，那么最终结果可能是负的。

```go
var u uint8 = 255
println(u, u+1, u*u) // 255 0 1

var i int8 = 127
println(i, i+1, i*i) // 127 -128 1
```

### string

两个字符串 A 和 B 使用 + 号进行拼接，会返回一个新字符串 C。如果连接涉及的数据量很大，代价高昂。

:::tip
这里应该补充系统性的性能测评
:::

因为字符串是不可修改的，因此尝试修改字符串内部数据的操作也是被禁止的。

```go
s[0] = 'L' // compile error: cannot assign to s[0]
```

不变性意味着，如果两个字符串共享相同的底层数据的话也是安全的，这使得复制任何长度的字符串代价是低廉的。同样，一个字符串 `s` 和对应的子字符串切片 `s[7:]` 的操作可以安全地共享相同的内存，因此字符串切片的代价也是低廉的。在这两种情况下都没有必要分配新的内存。

![](./image/2022-01-31-12-42-38.png)

一个字符串是包含只读字节的数据，一旦创建，是不可变的。相比之下，一个 []byte 的元素可以自由地修改，一般可以将 string 转成 []byte。

一个 `[]byte(s)` 转换是分配一个新的字节数组用于保存字符串数据的拷贝，然后引用这个底层的字节数组。

### 常量

常量表达式的值在编译期计算，而不是在运行期。常量的值不可修改，这样可以防止在运行期被恶意的修改。

所有常量的运算都可以在编译期完成，这样可以减少运行时的工作，也方便编译器优化。当操作数是常量时，一些运行时的错误也可以在编译时被发现，例如整数除零、字符串索引越界、任何导致无效浮点数的操作等。

许多常量没有一个明确的基础类型，编译器为这些没有明确基础类型的数组常量提供比基础类型更高精度的算数运算。例如。

```go
println(YiB/ZiB) // 1024
```

`YiB/ZiB` 的值已经超出任何Go语言中整数类型能表达的范围，但是它们依然是合法的常量。这个表达式在编译期计算出来的，并且结果常量是 1024。

### 数组

如果一个数组的元素类型是可比较的，那么数组类型也是可以相互比较的。

通过 `==` 运算符，只有当两个数组的所有元素都是相等的时候数组才是相等的。

```go
a := [2]int{1, 2}
b := [...]int{1, 2}
c := [2]int{1, 3}
fmt.Println(a == b, a == c, b == c) // "true false false"
d := [3]int{1, 2}
fmt.Println(a == d) // compile error: cannot compare [2]int == [3]int
```

当调用一个函数的时候，函数的每个调用参数将会被赋值给函数内部的参数变量，所以函数参数变量接收的是一个复制的副本，并不是原始调用的变量。

因为函数传递机制导致传递大的数组类型将是低效的，并且对数组参数的任何修改都是发生在复制的数组上。

```go
a := [...]int{1, 2, 3}
b := a // 此时修改 a 中的元素影响不到 b
```

### Slice

slice 是一个轻量级的数据结构，提供了访问数组子序列（或者全部）元素的功能，而且 slice 的底层确实引用一个数组对象。

slice 由三个部分组成，指针，长度和容量。
* 指针：指向第一个 slice 元素对应的底层数组元素的地址。（slice 的第一个元素并不一定就是数组的第一个元素）
* 长度：对应 slice 中元素的数目（长度不能超过容量）
* 容量：一般是从 slice 开始的位置到底层数组的结尾位置。

多个 slice 之间可以共享底层的数据，并且引用的数组部分区间可能重叠。

![](./image/2022-01-31-13-43-21.png)

因为 slice 值包含指向第一个 slice 元素的指针，因此向函数传递 slice 将允许在函数内部修改底层数组的元素。换句话说，复制一个 slice 只是对底层的数组创建了一个新的 slice 别名。

和数组不同的是，slice 之间不能比较，因此我们**不能使用** `==` 操作符来判断两个 slice 是否含有全部相等元素。标准库提供了 `bytes.Equal` 函数来判断两个 `[]byte` 是否相等，而其他类型的 slice 只能字节展开比对每个元素了。

一个零值的 slice 等于 nil，一个 nil 值的 slice 并没有底层数组。一个 nil 值的 slice 长度和容量都是 0，但是也有非 nil 值的 slice 的长度和容量也是 0。

```go
var s []int    // len(s) == 0, s == nil
s = nil        // len(s) == 0, s == nil
s = []int(nil) // len(s) == 0, s == nil

s = []int{}    // len(s) == 0, s != nil
```

#### 和函数传参的一些坑

传参的时候传入的是指针的复制。

```go
func main() {
	var list []string = []string{"Happy"}
	test(list)
	println(list[0])
}

func test(funcList []string) {
	funcList[0] = "New Year"
}
```

但是这样不能在 `test` 函数中调用 `append` 函数向该 `slice` 追加元素。

```go
func main() {
	var list []string = []string{"Happy"}
	test(list)
	println(list[0])
}

func test(funcList []string) {
    // 如果这样追加了，在 main 函数中的可能依然是 ["Happy"]
    // 不能保证 append 过后 slice 底层数组与 main 函数中的是否一致
	funcList = append(funcList, "New Year")
}
```

### map

key 可以是任意类型，但其值必须能用 `==` 运算符比较。

如果查找失败将返回 value 类型对应的零值。

map 中的元素并不是一个变量，因此不能对 map 的元素进行取址操作：
```go
_ = &ages["bob"] // compile error: cannot take address of map element
```
禁止对 map 元素取址的原因是 map 可能随着元素数量的增长而重新分配更大的内存空间，从而可能导致之前的地址无效。

map 的迭代顺序并不确定，顺序随机。

map 上的大部分操作，包括查找、删除、len 和 range 循环都可以安全工作在 nil 值的 map 上，它们的行为和一个空的 map 类似。但是向一个 nil 值的 map 存入元素将导致一个 panic 异常。所以向 map 存数据前必须先创建 map。

如果元素类型是一个数字，你可能需要区分一个已经存在的 0，和不存在而返回零值的 0，可以像下面这样测试。
```go
if age, ok := ages["bob"]; !ok { /* ... */ }
```

和 slice 一样，**map 之间也不能进行相等比较**，唯一的例外是可以和 nil 进行比较。

### 结构体

一个命名为 S 的结构体类型将不能再包含 S 类型的成员，可以包含 `*S` 指针类型的成员。

如果结构体没有任何成员的话就是空结构体，写作 `struct{}`，它的大小为 0，不包含任何信息。有些Go语言程序员用 map 来模拟 set 数据结构时，用它来代替 map 中布尔类型的 value，强调 key 的重要性。

如果要在函数内部修改结构体成员的话，用指针传入是必须的。在Go语言中，所有函数的参数都是值拷贝传入，如果不使用指针，将会拷贝一个完全一样的结构体变量。

如果结构体的全部成员都是可以比较的，那么结构体也是可以比较的。可比较的结构体类型和其他可比较类型一样，可以用于 map 的 key 类型。

### 函数

函数的类型被称为函数的签名。如果两个函数形式参数列表和返回值列表中的变量类型一一对应，那么这两个函数被认为有相同的类型或签名。形参和返回值的变量名不影响函数签名，也不影响它们是否可以以省略参数类型的形式表示。

实参通过值的方式传递，因此函数的形参是实参**值的拷贝**。对形参进行修改不会影响实参。

### 错误处理策略

#### 传播错误

```go
resp, err := http.Get(url)
if err != nil {
    return nil, err
}
```

```go
doc, err := html.Parse(resp.Body)
resp.Body.Close()
if err != nil {
    return nil, fmt.Errorf("parsing %s as HTML: %v", url, err)
}
```

由于错误信息经常是以链式组合在一起的，所以错误信息中应避免大写和换行符。

以os包为例，os包确保文件操作（如os.Open、Read、Write、Close）返回的每个错误的描述不仅仅包含错误的原因（如无权限，文件目录不存在）也包含文件名，**这样调用者在构造新的错误信息时无需再添加这些信息**。

一般而言，被调用函数f(x)会将调用信息和参数信息作为发生错误时的上下文放在错误信息中并返回给调用者，**调用者需要添加一些错误信息中不包含的信息**，比如添加url到html.Parse返回的错误中。

#### 重试尝试失败的操作

如果错误的发生是偶然性的，或由不可预知的问题导致的。**一个明智的选择是重新尝试失败的操作**。在重试时，我们需要限制重试的时间间隔或重试的次数，**防止无限制的重试**。

```go
func WaitForServer(url string) error {
    const timeout = 1 * time.Minute
    deadline := time.Now().Add(timeout)

    for tries := 0; time.Now().Before(deadline); tries ++ {
        _, err := http.Head(url)
        if err == nil {
            return nil // success
        }

        log.Printf("server not responding (%s); retrying...", err)
        time.Sleep(time.Second << uint(tries))
    }

    return fmt.Errorf("server %s failed to respond after %s", url, timeout)
}
```

#### 错误发生导致无法运行

输出错误信息并结束程序。这种策略只应在 main 中执行，对库函数而言，应仅向上传播。

```go
if err := WaitForServer(url); err != nil {
    fmt.Fprintf(os.Stderr, "Site is down: %v\n", err)
    os.Exit(1)

    // or use log.Fatalf
    // log.Fatalf("Site is down: %v\n", err)
}
```

#### 只输出错误信息不中断程序

rt

#### 忽略错误

rt

### 函数

函数类型的零值是 nil，而且函数类型不可比较

#### 回调陷阱

```go
var rmdirs []func()
for _, dir := range tempDirs() {
    os.MkdirAll(dir, 0755)
    rmdirs = append(rmdirs, func() {
        os.RemoveAll(dir) // NOTE: incorrect!
    })
}
```

for 循环语句引入了新的词法块，循环变量 dir 在这个词法块中被声明。在该循环中生成的所有函数值都共享相同的循环变量。函数值中记录的是循环变量的内存地址，而不是循环变量某一时刻的值。后续的迭代会不断更新 dir 的值，当删除操作执行时，for 循环已完成，dir 中存储的值等于最后一次迭代的值。

#### 可变参数

和 JavaScript 稍微有点不同。

```go
func sum(vals ...int) int {
    total := 0
    for _, val := range vals {
        total += val
    }
    return total
}
```

```go
println(sum(1, 2, 3, 4)) // 10

values := []int{1, 2, 3, 4}
println(sum(values...))
```

虽然在 ...int 型参数行为看起来像切片类型，但实际上是不同的类型。

```go
func f(...int) {}
func g([]int) {}

println("%T\n", f) // "func(...int)"
println("%T\n", g) // "func([]int)"
```

#### defer

defer 语句经常被用于处理成对的操作，如打开、关闭、连接、断开连接、加锁、释放锁。通过defer机制，不论函数逻辑多复杂，都能保证在任何执行路径下，资源被释放。

调试复杂程序时，defer 机制也常被用于记录何时进入和退出函数。通过这种方式， 我们可以只通过一条语句控制函数的入口和所有的出口，甚至可以记录函数的运行时间，如例子中的 start。

```go
func bigSlowOperation() {
    // 注意末尾的括号
    // defer 接收的是一个函数，在外层函数时会帮你调用
    // 而 trace 函数返回的是一个函数
    defer trace("bigSlowOperation")() 

    // do lots of work
    time.Sleep(10 * time.Second)
}

func trace(msg string) func() {
    start := time.Now()
    log.Printf("enter %s", msg)

    return func() {
        log.Printf("exit %s (%s)", msg, time.Since(start))
    }
}
```

defer 语句中的函数会在 return 语句更新返回值后再执行。所以，对匿名函数采用 defer 机制，可以观察函数的返回值。

```go
func double(x int) (result int) {
    defer func() {
        fmt.Printf("double(%d) = %d\n", x, result)
    }

    return x*x
}
```

被延迟执行的匿名函数甚至可以修改函数返回给调用者的返回值。

```go
func triple(x int) (result int) {
    defer func() {
        result += x
    }

    return double(x)
}
```

在**循环体**中的 defer 语句需要特别注意，因为只有在函数执行完毕后，这些被延迟的函数才会执行。下面的代码会导致系统的文件描述符耗尽。

```go
for _, filename := range filenamse {
    f, err := os.Open(filename)
    if err != nil {
        return err
    }
    defer f.Close()

    // do something
}
```

一种解决方法是将循环体中的 defer 语句一致另外一个函数，在每次循环时，调用这个函数。

```go
for _, filename := range filenames {
    if err := doFile(filename); err != nil {
        return err
    }
}

func doFile(filename string) error {
    f, err := os.Open(filename)
    if err != nil {
        return err
    }
    defer f.Close()

    // do something
}
```

#### panic

当 panic 异常发生时，程序会中断运行，并立即执行在该 goroutine 中被延迟的函数（defer 机制）。

当某些不应该发生的场景发生时，我们就应该调用 panic。

虽然 Go 的 panic 机制类似于其他语言的异常，但 panic 的适用场景有一些不同。由于 panic 会引起程序的崩溃，因此 panic 一般用于严重错误，如程序内部的逻辑不一致。在健壮的程序中，任何可以预料到的错误，如不正确的输入、错误的配置或是失败的I/O操作都应该被优雅的处理，最好的处理方式，就是使用Go的错误机制。

在 GO 的 panic 机制中，延迟函数的调用在释放堆栈信息之前。

通常来说，不应该对 panic 异常做任何处理，但有时，也许我们可以从异常中恢复，至少我们可以在程序崩溃前，做一些操作。举个例子，当web服务器遇到不可预料的严重问题时，在崩溃前应该将所有的连接关闭；如果不做任何处理，会使得客户端一直处于等待状态。

如果在 deferred 函数中调用了内置函数 recover，并且定义该 defer 语句的函数发生了 panic 异常，recover 会使程序从 panic 中恢复，并返回 panic value。导致 panic 异常的函数不会继续运行，但能正常返回。在未发生 panic 时调用 recover，recover 会返回 nil。

```go
func Parse(input string) (s *Syntax, err error) {
    defer func() {
        if p := recover(); p != nil {
            err = fmt.Errorf("internal error: %v", p)
        }
    }

    // may panic
}
```

不加区分的恢复所有的 panic 异常，不是可取的做法。虽然把对panic的处理都集中在一个包下，有助于简化对复杂和不可以预料问题的处理，但作为被广泛遵守的规范，**你不应该试图去恢复其他包引起的 panic**。

公有的API应该将函数的运行失败作为 error 返回，而不是 panic。同样的，你也不应该恢复一个由他人开发的函数引起的 panic，比如说调用者传入的回调函数，因为你无法确保这样做是安全的。

基于以上原因，安全的做法是有选择性的 recover。

```go
func soleTitle(doc *html.Node) (title string, err error) {
    type bailout struct{}

    defer func() {
        switch p := recover(); p {
        case nil:       // no panic
        case bailout{}: // "expected" panic
            err = fmt.Errorf("multiple title elements")
        default:
            panic(p) // unexpected panic; carry on panicking
        }
    }()
    // do something
    // and then 
    // panic(bailout{})
}
```

### 方法

只有类型（Point）和指向它们的指针（*Point），才可能是出现在接收器声明里的两种接收器。此外，为了避免起义，在声明方法时，如果一个类型名本身是一个指针的话，是不允许其出现在接收器中的。

```go
type P *int

// compile error: invalid receiver type
func (P) f() {/**/}
```

在声明一个 method 的 receiver 该是指针类型还是非指针类型时，需要考虑这个对象本身是不是特别大。如果声明为非指针变量时，调用会产生一次拷贝。还需要考虑是否需要进行修改，因为指针类型指向的始终是一块内存地址。

#### nil 也是一个合法的接收器类型

```go
type IntList struct {
    Value int
    Tail *IntList
}

func (list *IntList) Sum() int {
    if list == nil {
        return 0
    }
    return list.Value + list.Tail.Sum()
}
```

方法值和函数值类似，但是赋值时就会绑定了调用对象。

```go
a := Point{1, 2}
b := Point{4, 6}

distanceFromA := a.Distance
println(distanceFromA(b))
```

### 接口

一个类型如果拥有一个接口需要的所有方法，那么这个类型就实现了这个接口。

`fmt.Stringer` 接口需要实现 `String() string`

```go
type IntSet struct{}

func (s *IntSet) String() string {
	return ""
}

var s IntSet
var _ fmt.Stringer = &s // 可以
var _ fmt.Stringer = s  // 缺少 String 方法
```

即使具体类型有其他的方法，也只有接口类型暴露出来的方法会被调用到。

接口像是指针，下面 4 个语句中，变量 w 得到了 3 个不同的值。（开始和最后的值是相同的）

```go
var w io.Writer
w = os.Stdout
w = new(bytes.Buffer)
w = nil
```

![](./image/2022-02-03-16-26-22.png)

![](./image/2022-02-03-16-26-33.png)

![](./image/2022-02-03-16-26-43.png)

从概念上讲，不论接口值多大，动态值总是可以容下它。

![](./image/2022-02-03-16-27-02.png)

接口值可以使用 `==` 和 `!＝` 来进行比较。两个接口值相等仅当它们都是 `nil` 值，或者它们的动态类型相同并且动态值也根据这个动态类型的==操作相等。因为接口值是可比较的，所以它们可以用在 `map` 的键或者作为 `switch` 语句的操作数。

然而，如果两个接口值的动态类型相同，但是这个动态类型**是不可比较**的（比如切片），将它们进行比较就会失败并且panic:

```go
var x interface{} = []int{1, 2, 3}
fmt.Println(x == x) // panic: comparing uncomparable type []int
```

#### 警告：一个包含nil指针的接口不是nil接口

一个不包含任何值的 nil 接口值和一个刚好包含 nil 指针的接口值是不同的。

当 debug 变量设置为 true 时，main 函数会将 f函数的输出收集到一个 bytes.Buffer 类型中。

```go
const debug = true

func main() {
    var buf *bytes.Buffer
    if debug {
        buf = new(bytes.Buffer) // enable collection of output
    }
    f(buf) // NOTE: subtly incorrect!
    if debug {
        // ...use buf...
    }
}

// If out is non-nil, output will be written to it.
func f(out io.Writer) {
    // ...do something...
    if out != nil {
        out.Write([]byte("done!\n"))
    }
}
```

可能会预计当把变量 debug 设置为 false 时可以禁止对输出的收集，但是实际上在 out.Write 方法调用时程序发生了 panic：

```go
if out != nil {
    out.Write([]byte("done!\n")) // panic: nil pointer dereference
}
```

当 `main` 函数调用函数f 时，它给 f函数的 `out` 参数赋了一个 `*bytes.Buffer` 的空指针，所以 `out` 的动态值是 `nil`。然而，它的动态类型是 `*bytes.Buffer`，意思就是 `out` 变量是一个包含空指针值的非空接口，所以防御性检查 `out!=nil` 的结果依然是 `true`。

![](./image/2022-02-03-16-25-59.png)

动态分配机制依然决定 `(*bytes.Buffer).Write` 的方法会被调用，但是这次的接收者的值是 `nil`。对于一些如 `*os.File` 的类型，`nil` 是一个有效的接收者，但是 `*bytes.Buffer` 类型不在这些种类中。这个方法会被调用，但是当它尝试去获取缓冲区时会发生 `panic`。

#### sort.Interface

利用结构体回调实现多层排序函数。

```go
type customSort struct {
    t    []*Track
    less func(x, y *Track) bool
}

func (x customSort) Len() int           { return len(x.t) }
func (x customSort) Less(i, j int) bool { return x.less(x.t[i], x.t[j]) }
func (x customSort) Swap(i, j int)    { x.t[i], x.t[j] = x.t[j], x.t[i] }
```

```go
sort.Sort(customSort{tracks, func(x, y *Track) bool {
    if x.Title != y.Title {
        return x.Title < y.Title
    }
    if x.Year != y.Year {
        return x.Year < y.Year
    }
    if x.Length != y.Length {
        return x.Length < y.Length
    }
    return false
}})
```

#### 断言

如果断言操作的对象是一个 `nil` 接口值，那么不论被断言的类型是什么这个类型断言都会失败。一般断言是这么使用的。

```go
if f, ok := w.(*os.File); ok {
    // use f
}
```

#### 通过类型断言查询接口

```go
func writeString(w io.Writer, s string) (n int, err error) {

    // 想看看 w 这个值里有没有 WriteString 方法
    // io.Writer 类型肯定没有，但是 w 可能有
    type stringWriter interface {
        WriteString(string) (n int, err error)
    }

    // 断言，断言成功则代表 w 里有 WriteString 方法
    if sw, ok := w.(stringWriter); ok {
        return sw.WriteString(s) 
    }
    return w.Write([]byte(s)) 
}
```

### goroutine

channel 对应一个 `make` 创建的底层数据结构的引用。当我们复制一个 channel 或用于函数参数传递时，我们只是拷贝了一个 channel 引用，因此调用者和被调用者将引用同一个 channel 对象。和其它的引用类型一样，channel 的零值也是 `nil`。

两个相同类型的 `channel` 可以使用==运算符比较。如果两个 `channel` 引用的是相同的对象，那么比较的结果为 `true`。

当一个 channel 被关闭后，再向该 channel 发送数据将导致 panic 异常。当一个被关闭的 channel 中已经发送的数据都被成功接收后，后续的接收操作将不再阻塞，它们会立即返回一个零值。

试图重复关闭一个 channel 将导致 panic 异常，试图关闭一个 nil 值的 channel 也将导致 panic 异常。

没有办法直接测试一个 channel 是否被关闭，但是接收操作有一个变体形式：它多接收一个结果，多接收的第二个结果是一个布尔值 `ok`，`true` 表示成功从 channels 接收到值，`false` 表示 channels 已经被关闭并且里面没有值可接收。

```go
x, ok := <-naturals
if !ok {
    break // channel was closed and drained
}
```

使用 range 循环，它依次从 channel 接收数据，当 channel 被关闭并且没有值可接收时跳出循环。

```go
func main() {
    naturals := make(chan int)
    squares := make(chan int)

    // Counter
    go func() {
        for x := 0; x < 100; x++ {
            naturals <- x
        }
        close(naturals)
    }()

    // Squarer
    go func() {
        for x := range naturals {
            squares <- x * x
        }
        close(squares)
    }()

    // Printer (in main goroutine)
    for x := range squares {
        fmt.Println(x)
    }
}
```

基于 channels 发送消息有两个重要方面。首先每个消息都有一个值，但是有时候通讯的事实和发生的时刻也同样重要。当我们更希望强调通讯发生的时刻时，我们将它称为消息事件。有些消息事件并不携带额外的信息，它仅仅是用作两个 goroutine 之间的同步，这时候我们可以用 `struct{}` 空结构体作为 channels 元素的类型，虽然也可以使用 `bool` 或 `int` 类型实现同样的功能，`done <- 1` 语句也比 `done <- struct{}{}` 更短。

#### 管道

Channels 也可以用于将多个 goroutine 连接在一起，一个 Channel 的输出作为下一个 Channel 的输入。这种串联的 Channels 就是所谓的管道（pipeline）。

![](./image/2022-02-04-14-54-46.png)

#### 单方向的 channel

类型 `chan<- int` 表示一个只发送 `int` 的channel，只能发送不能接收。相反，类型 `<-chan int` 表示一个只接收 `int` 的channel，只能接收不能发送。

因为关闭操作只用于断言不再向 channel 发送新的数据，所以只有在发送者所在的 goroutine 才会调用 close 函数，因此对一个只接收的 channel 调用 `close` 将是一个编译错误。

```go
func counter(out chan<- int) {
    for x := 0; x < 100; x++ {
        out <- x
    }
    close(out)
}

func squarer(out chan<- int, in <-chan int) {
    for v := range in {
        out <- v * v
    }
    close(out)
}

func printer(in <-chan int) {
    for v := range in {
        fmt.Println(v)
    }
}

func main() {
    naturals := make(chan int)
    squares := make(chan int)
    go counter(naturals)
    go squarer(squares, naturals)
    printer(squares)
}
```

#### select

`ch` 这个 channel 的 buffer 大小是 1，所以会交替的为空或为满，所以只有一个 case 可以进行下去，无论i是奇数或者偶数，它都会打印 `0 2 4 6 8`。

（`0` 塞进去了，`1` 不能塞进去，此时这次 select 就输出了 2，`i = 1`就被用于输出了）

```go
ch := make(chan int, 1)
for i := 0; i < 10; i++ {
    select {
    case x := <-ch:
        fmt.Println(x) // "0" "2" "4" "6" "8"
    case ch <- i:
    }
}
```

如果多个 case 同时就绪时，**select 会随机地选择一个执行**，这样来保证每一个 channel 都有平等的被 select 的机会。

在 select 语句中操作 nil 的 channel 永远都不会被 select 到。这使得可以用 nil 来激活或者禁用 case，来达成处理其它输入或输出事件时超时和取消的逻辑。