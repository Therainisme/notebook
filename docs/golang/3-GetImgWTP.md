# GET 获取图片并写入文件

```go
response, err := http.Get("https://avatars.githubusercontent.com/u/41776735?v=4")
if err != nil {
	fmt.Println("A error occurred!")
	return
}
defer response.Body.Close()

reader := bufio.NewReaderSize(response.Body, 4096)

file, _ := os.Create("therainisme-avatar.png")
defer file.Close()

// 获得文件的 Writer 对象
writer := bufio.NewWriter(file)

// 开始写入文件
written, _ := io.Copy(writer, reader)
fmt.Printf("Total length: %d", written)
```