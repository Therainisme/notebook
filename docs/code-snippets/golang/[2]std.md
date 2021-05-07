# 标准库

[Golang标准库（中文）](http://doc.golang.ltd/)

## 业务相关

### runtime：和go运行时环境的互操作

### reflect：反射

### sync/*：同步相关

### database/sql：SQL数据库泛用接口

### time：时间相关

### testing：测试

### regexp/*：正则相关

### text/*：文本相关

### encoding/*：解析

### encoding/csv：csv文件相关

### encoding/hex：16进制相关

### encoding/json：json相关

### encoding/xml：xml相关

### debug/*：调试

### flag：命令行参数解析

### log/*：日至相关

### unicode/*：测试Unicode代码点的一些属性

### unsafe：跳过go语言类型安全限制的操作

## 数据结构

### strings：字符串相关

### container/heap：堆

### container/list：双向链表

### container/ring：环行链表

### index/suffixarray：查找子串（快）

### math/*：数学相关

### sort：排序

## 多媒体

### html/*：转义和解转义HTML文本

### image/*：操作图片相关

### net/*：网络相关

```go
listener, err := net.Listen("tcp", ":8080")
if err != nil {
	// handle error
}
defer listener.Close()
for {
	conn, err := listener.Accept()
	if err != nil {
		// handle error
		continue
	}
	go handleConnection(conn)
}
```

### os/*：操作系统相关

### path/*：对'/'的路径情有独钟

### filepath：对文件路径情有独钟

## 不知道

### context 

## 压缩文件

### archive/tar：tar

### archive/zip：zip

### compress/bzip2：bzip2

### compress/flate：flate

### compress/gzip：gzip

### compress/lzw：GIF、TIFF、PDF文件的lzw压缩格式

### compress/zlib：zlib

## I/O

### bufio：有缓存的I/O

## 加密解密

### crypto/*