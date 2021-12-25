# JSON 数据对象处理

```go
type User struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}
```

* JSON to Object

```go
jsonString := `{"name":"Therainisme","password":"123456"}`
jsonByte := []byte(jsonString)
user := &User{}
json.Unmarshal(jsonByte, user)
println(user.Name, user.Password)
```

* Object to JSON

```go
user := &User{
	Name:     "Therainisme",
	Password: "123456",
}
jsonByte, _ := json.Marshal(user)
println(string(jsonByte))
```