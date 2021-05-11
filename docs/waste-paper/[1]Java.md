# Java复习纲要

众所周知，Java准备要考试，但是不知道是哪天。编辑时间：2021-05-02 19:31:23。

我的目标是：能过就行！

## 先从去年的期末考试题目入手

> [桂林电子科技大学2018级JAVA-A卷](/file/2018级JAVA-A卷.pdf)

### 设计一能求解多种椎体体积的控制台程序

要求：求解圆锥、三棱锥。必须具备强大的可拓展性，未来可能需要求其他类型的椎体体积。请说明关键设计步骤。（可用UML图表示）

::: tip 捞分细则
别弄那么多华丽胡哨的UML,认真写就好了，中文字多优美啊。

接口、抽象类至少得用一个，不然老师都不好给分。所以啊，说明题就得凑，就硬凑。
:::

这类描述体有六点，都得踩点答题

* 抽象类

设计一抽象类`Shape`表示平面几何形状，用来当作椎体的底，含有一抽象方法`double getArea()`。

* 继承类

设计一椎体类`Cone`，包含两个属性：`Shape bottomShaper`、`double height`，分别代表椎体底面形状和高度。

该椎体的构造方法为：`Cone(Shape bottomShape, double height)`

获取体积的方法为：`double getV() {return bottomShape.getArea() * height / 3.0;}`

* 实现抽象类的类

> 圆形

设计一`Circle`类，继承抽象类`Shape`，表示圆形。它继承抽象类`Shape`。

构造方法为：`Circle(double radius)`

基本属性为`radius`表示圆的半径，重写获取其面积的方法`getArea()`。

> 三角形

描述方法同上

* 利用代码举例

```java
Cone 圆锥 = new Cone(new Circle(3.0), 5); // 构建圆锥对象，底面半径为3,高为5
Cone 三棱锥 = new Cone(new Triangle(3, 4, 5), 6); // 描述....
double v1 = 圆锥.getV();
double v2 = 三棱锥.getV();
```

* 描述拓展性

若要求其他类型的椎体的体积，只需要定义表示其底部形状、且继承`Shape`的类，只需要在类的定义中重写`getArea`方法，
就可以像之前那样，求新的类型的椎体体积，不用修改其他任何代码。

::: tip 总结
题目要求就是大爷，哪怕完成不了都得吹
:::

### 设计一GUI程序判断三角形

要求：通过界面输入三个数判断是否能构成三角形，如果能，则判断是什么类型的三角形，给出解决方案。

1. 实现三角形类
2. JFrame窗口框，里面有什么有什么
3. 创建事件监听器，实现啥啥啥方法。这些方法又有什么用（我赌它GUI不可能考太难）

### 程序分析题

::: tip 捞分细则
只要说明它错了，就有分！ 
:::

### 程序阅读题

::: tip 捞分细则
为什么考多线程？
:::

### 编程题

::: tip 捞分细则
GUI部分比较恶心，背一些关键的类就行了
:::

# 面向考试复习

## 传值

### 上/下转型对象

首先定义两个类，他们是继承关系

```java
class Father {
    void say() {
        System.out.println("I'm father.");
    }
}

class Son extends Father {
    public void say() {
        System.out.println("I'm son.");
    }

    public void cry() {
        System.out.println("I'm crying.");
    }
}
```

### 上转型对象

```java
// 这个son变量是一个上转型对象
IFather son = new Son();
// 他现在是Father类型，Fahter里有say()方法，所以可以用
son.say();
// IFather这个接口里面有cay()方法吗？
// 没有！所以啊，如果不强制转化的话，不可能用cry()方法
((Son) son).cry();
```

### 下转型对象

```java
// ... 同样是上面的Father和Son 代码略
Father father = new Father();
// 此时father成了Son类
// 编译器为了使用Son类的新特性cry()，必须强转类型，不转会报错
Son faker = (Son) father;
```

### 值传递 & 引用传递

::: tip 总结
传入的参数是八种数据类型的一种，就是值传递

传入的参数是一个对象，就是引用传递，不会创建副本，引用传递在函数中可以改变原始对象
:::

```java
void modified (int a, int b) {
    // 这个函数会传入两个值
    // 这里的a和b是复制品
    // 如果在这个函数里面修改a和b
    // 不会改变外面的a和b
}
```

```java
void modified (User user) {
    user.setName("唤雨考拉"); // 能修改成功
}
```

### 精度转化

::: tip 总结
低精度向高精度转化，随便转，就比如说小孩可以随便穿大人的衣服

高精度向低精度转化，必须得强制转化`int low = (int) height;`。因为会丢失精度，不建议那么做，所以Java要你多写一点代码。
:::

下面的八种数据类型精度从低到高

`byte` `short` `char` `int` `long` `float` `double`

## GUI

虽然我们老师说不考，但是考到就完了啊，所以我打算把比较常用的方法记下来

::: tip 写在前面
我赌它就算考了，实现的功能也不会很难
:::

### 窗体 & 容器

JFrame类或它的子类：

```java
MyWindow t = new MyWindow();
t.setSize(300, 200); // 设置窗口宽高
t.setVisible(true);  // 让它显形

container.add(new JButton("登陆")); // 向一个组件内部添加组件
```

### 文本

```java
// 显示框
JLabel l = new JLabel("这里是你想显示的文本");

// 输入框
JTextField textField = new JTextField("");
textField.setText("请输入密码");
String text = textField.getText(); // 获取输入的内容
```

### 按钮

```java
// 按钮的位置应该不会写，做多设置设置宽度，同上就行了
JButton btnLogin = new JButton("登陆");
container.add(btnLogin);

// 添加点击事件
// 注意！这个that对象必须是实现ActionListener接口的类或其子类
// 当按钮被点击时，调用that对象上的
// public void actionPerformed(ActionEvent e){..}方法
btnLogin.addActionListener(that);
```

### 弹出的对话框

```java
// f是父组件
// 能点击确定或不确定的对话框
int option = JOptionPane.showConfirmDialog(f, "是否 使用外挂 ？");
if (JOptionPane.OK_OPTION == option) {
    // 能输入的对话框
    String answer = JOptionPane.showInputDialog(f, "请输入yes，表明使用外挂后果自负");
    if ("yes".equals(answer)) {
        // 只能点确定的对话框
        JOptionPane.showMessageDialog(f, "你使用外挂被抓住！ 罚拣肥皂3次！");
    }
}
```

## Thread类与Runnable接口

::: tip 写在前面
`Thread`是线程，`Runnable`是线程体，注意！`Thread`实现了`Runnable`接口！
:::

```java
// 注意，这个That是实现了Runable接口的类
Thread t = new Thread(that);
// 当调用start方法时，会找到that实例对象中的run方法执行！
t.start();
// 因为Thread实现了Runnable接口，所以that可以是Thread相关类或Runnable相关类
```

## 改错题

* 上转型 & 下转型
* 返回值类型错误
* 忘记`throws`异常 | `throws`和`throw`互用错
* `float`类型赋值记得加`f`，`long`类型赋值记得加`l`
* 被`final`修饰的成员变量也必须显式地赋值
* 在构造器中使用 `super()` 调用父类中的其他构造方法时，该语句必须处于构造器的首行，否则编译器会报错。另外，`this` 调用本类中的其他构造方法时，也要放在首行。
* `this`、`super`不能用在`static`方法中。

## 杂语

### ==和 equals 的区别

对于基本数据类型来说，==比较的是**值**。对于引用数据类型来说，==比较的是对象的**内存地址**。

因为 Java **只有值传递**，所以，对于 == 来说，不管是比较基本数据类型，还是引用数据类型的变量，其本质比较的都是值，**只是引用类型变量存的值是对象的地址**。

`equals()` 作用不能用于判断基本数据类型的变量，只能用来判断两个对象是否相等。`equals()`方法存在于`Object`类中，而`Object`类是所有类的直接或间接父类。

`String` 中的 `equals` 方法是被重写过的，因为 `Object` 的 `equals` 方法是比较的对象的内存地址，而 `String` 的 `equals` 方法比较的是对象的值。
当创建 `String` 类型的对象时，虚拟机会在常量池中查找有没有已经存在的值和要创建的值相同的对象，如果有就把它赋给当前引用。如果没有就在常量池中重新创建一个 `String` 对象。

