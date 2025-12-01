# JavaScript 模块化架构说明

## 项目结构

本项目已从单一的内联JavaScript文件重构为模块化的ES6模块架构。

```
frontend/
├── static/
│   ├── js/
│   │   ├── main.js          # 主入口模块，负责初始化应用程序
│   │   ├── utils.js         # 工具函数模块（时间格式化、文本创建等）
│   │   ├── uiManager.js     # UI管理模块（按钮、容器、浮层等）
│   │   ├── logManager.js    # 日志管理模块（角色日志显示和更新）
│   │   ├── gameConfig.js    # Phaser游戏配置模块
│   │   └── gameScene.js     # Phaser游戏场景模块（preload、create、update）
│   └── css/
│       └── style.css        # 样式文件
└── templates/
    └── main_script.html     # 精简的入口文件，接收Flask模板变量
```

## 模块说明

### main.js
- **职责**: 应用程序的主入口点
- **功能**: 
  - 接收Flask模板传入的配置数据
  - 初始化所有模块
  - 协调模块之间的交互
  - 创建Phaser游戏实例

### utils.js
- **职责**: 提供通用的工具函数
- **导出函数**:
  - `formatTimestamp(date)`: 格式化时间戳为日志格式
  - `addText(game, x, y, text, background, zoom)`: 创建Phaser文本对象
  - `addScrollableText(game, x, y, text, background, maxHeight, boxWidth, zoom)`: 创建可滚动的文本容器

### uiManager.js
- **职责**: 管理用户界面元素
- **功能**:
  - 创建【人物日志】按钮
  - 创建右侧日志显示容器
  - 创建左侧浮层和人物列表
  - 处理角色选择事件

### logManager.js
- **职责**: 管理角色日志的显示和更新
- **导出函数**:
  - `updateRightContainerLogs()`: 更新右侧容器的日志显示
  - `updateAgentLogs()`: 更新游戏内的代理日志显示
  - `updateAgentList()`: 更新代理列表显示

### gameConfig.js
- **职责**: Phaser游戏配置
- **功能**: 创建Phaser游戏配置对象

### gameScene.js
- **职责**: Phaser游戏场景逻辑
- **功能**:
  - `preload()`: 加载游戏资源
  - `create()`: 创建游戏场景、UI元素、角色等
  - `update()`: 游戏循环更新逻辑（角色移动、时间更新等）

## 使用方式

1. **Flask模板集成**: `main_script.html` 使用动态import加载主模块，并传递Flask模板变量
2. **模块导入**: 所有模块使用ES6的 `import/export` 语法
3. **依赖关系**: 
   - `main.js` → 导入所有其他模块
   - `gameScene.js` → 导入 `utils.js` 和 `logManager.js`
   - `uiManager.js` → 独立模块
   - `logManager.js` → 导入 `utils.js`

## 优势

1. **模块化**: 代码按功能拆分，易于维护
2. **可复用**: 工具函数可在多个模块中复用
3. **可测试**: 每个模块可独立测试
4. **可扩展**: 新功能可作为新模块添加
5. **清晰依赖**: 模块间的依赖关系明确

## 注意事项

- 所有模块使用ES6模块语法（`import/export`）
- 浏览器需要支持ES6模块（现代浏览器均支持）
- Flask模板变量通过动态import传递，确保路径正确解析

