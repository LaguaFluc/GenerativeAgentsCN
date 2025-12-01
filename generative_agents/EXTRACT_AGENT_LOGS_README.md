# Agent日志提取工具使用说明

## 功能说明

`extract_agent_logs.py` 脚本用于从 `simulate-*.json` checkpoint文件中提取每个agent的阶段性信息，为每个agent创建单独的时间段日志文件。

## 使用方法

### 基本用法

```bash
python extract_agent_logs.py --checkpoints results/checkpoints/sim-5-agent-6h
```

### 指定输出文件夹

```bash
python extract_agent_logs.py --checkpoints results/checkpoints/sim-5-agent-6h --output results/checkpoints/sim-5-agent-6h/agent_logs
```

## 参数说明

- `--checkpoints`: **必需**，checkpoints文件夹路径（例如：`results/checkpoints/sim-5-agent-6h`）
- `--output`: **可选**，输出文件夹路径。如果不指定，默认使用 `{checkpoints_folder}/agent_logs`

## 输出文件

脚本会在输出文件夹中生成以下文件：

### 1. 每个Agent的完整时间线日志
- 文件名格式：`{agent_name}_timeline.json`
- 包含每个时间段（10分钟）的完整信息：
  - `timestamp`: 时间戳
  - `step`: 步骤编号
  - `status`: 状态信息（如poignancy）
  - `currently`: 当前活动描述
  - `action`: 当前动作详情
  - `coord`: 坐标位置
  - `schedule`: 日程安排
  - `chats`: 对话记录

### 2. 每个Agent的简化时间线日志
- 文件名格式：`{agent_name}_simplified.json`
- 包含关键信息的简化版本：
  - `timestamp`: 时间戳
  - `step`: 步骤编号
  - `status`: 状态信息
  - `currently`: 当前活动描述
  - `action_describe`: 动作描述
  - `location`: 位置
  - `coord`: 坐标
  - `chats_count`: 对话数量

### 3. 汇总信息文件
- 文件名：`summary.json`
- 包含：
  - 提取时间
  - checkpoint文件总数
  - 每个agent的时间段统计信息

## 示例

假设你有一个simulation名为 `sim-5-agent-6h`，运行：

```bash
python extract_agent_logs.py --checkpoints results/checkpoints/sim-5-agent-6h
```

会在 `results/checkpoints/sim-5-agent-6h/agent_logs/` 文件夹下生成：

```
agent_logs/
├── 林晚星_timeline.json      # 完整版
├── 林晚星_simplified.json    # 简化版
├── 江寻_timeline.json
├── 江寻_simplified.json
├── 陈屿_timeline.json
├── 陈屿_simplified.json
├── 苏沐晴_timeline.json
├── 苏沐晴_simplified.json
├── 夏屿风_timeline.json
├── 夏屿风_simplified.json
└── summary.json              # 汇总信息
```

## 使用场景

1. **分析单个Agent的行为轨迹**：查看某个agent在整个模拟过程中的状态变化
2. **对比不同Agent的活动**：比较不同agent在同一时间段的行为
3. **快速查看关键信息**：使用简化版文件快速浏览agent的状态变化
4. **数据分析和可视化**：基于提取的JSON数据进行进一步的数据分析和可视化

## 注意事项

- 脚本会自动按时间顺序处理所有 `simulate-*.json` 文件
- 如果某个checkpoint文件损坏或格式不正确，脚本会跳过该文件并继续处理其他文件
- 输出文件使用UTF-8编码，支持中文agent名称

