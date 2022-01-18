# RPC

## rpc-server.go

```go
// 四点必须！
// 1. 方法对外暴露
// 2. 第一个参数是客户端传递的变量
// 3. 第二个参数是将要返回给客户端的结果变量指针
// 4. 方法返回一个 error
func (r *Rectangular) GetArea(p Params, res *int) error {
	*res = p.Width * p.Height
	log.Println("GetArea was being called")
	return nil
}

func (r *Rectangular) GetPerimeter(p Params, res *int) error {
	*res = (p.Width + p.Height) * 2
	log.Println("GetPerimeter was being called")
	return nil
}

func main() {
	// 注册服务
	rect := new(Rectangular)
	err := rpc.Register(rect)
	if err != nil {
		log.Fatal(err)
	}

	// 把服务绑定到 HTTP 上
	rpc.HandleHTTP()

	// 监听服务，等待客户端调用方法
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
```

## rpc-client.go

```go
type Params struct {
	Width  int
	Height int
}

func main() {
	// 调用远程 RPC 服务
	rpcClient, err := rpc.DialHTTP("tcp", ":8080")
	if err != nil {
		log.Fatal(err)
	}

	// 调用远程方法

	// 存储结果的变量
	res := 0

	// 求面积
	err = rpcClient.Call("Rectangular.GetArea", Params{100, 50}, &res)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Area：", res)

	// 求周长
	err = rpcClient.Call("Rectangular.GetPerimeter", Params{100, 50}, &res)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Perimeter", res)
}
```