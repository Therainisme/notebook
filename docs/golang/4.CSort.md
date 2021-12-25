# 自定义对象排序

* 声明

```go
type User struct {
	Name  string
	Value int
}
```

* 实现接口

```go
type UserArray []*User

func (array UserArray) Len() int {
	return len(array)
}
func (array UserArray) Swap(a, b int) {
	array[a], array[b] = array[b], array[a]
}
func (array UserArray) Less(i, j int) bool {
	// 左 < 右 是降序
	return array[i].Value < array[j].Value
}
```

* 使用

```go
sort.Sort(testUserArray)
```

* 样例

```go
user1 := &User{Name: "T1", Value: 2}
user2 := &User{Name: "T2", Value: 1}
user3 := &User{Name: "T3", Value: 3}
testUserArray := UserArray{user1, user2, user3}

sort.Sort(testUserArray)

for _, user := range testUserArray {
	println(user.Name, user.Value)
}
```