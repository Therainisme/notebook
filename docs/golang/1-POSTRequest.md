# 发送 POST 请求

```go
requestJSON := `{"name":"therainisme","password":"123456"}`
requestBodyByte := []byte(requestJSON)
requestReader := bytes.NewReader(requestBodyByte)
request, err := http.NewRequest("POST", "https://xxxxxx/api/user/login", requestReader)
request.Header.Set("Content-Type", "application/json")
if err != nil {
    println(err.Error())
}

client := &http.Client{}
response, err := client.Do(request)
if err != nil {
    println(err.Error())
}
defer response.Body.Close()

responseBody, err := ioutil.ReadAll(response.Body)
if err != nil {
    println(err.Error())
}
println(string(responseBody))
```