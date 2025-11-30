import os
import json
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify

from compress import frames_per_step, file_movement
from start import personas

# 获取脚本所在目录的绝对路径
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 使用绝对路径配置Flask的模板和静态文件夹
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "frontend/templates"),
    static_folder=os.path.join(BASE_DIR, "frontend/static"),
    static_url_path="/static",
)


def load_agent_logs(name):
    """
    加载agent日志数据
    
    Args:
        name: 模拟名称
        
    Returns:
        dict: agent日志数据，格式为 {agent_name: simplified_logs_data}
    """
    checkpoints_folder = os.path.join(BASE_DIR, "results/checkpoints", name)
    agent_logs_folder = os.path.join(checkpoints_folder, "agent_logs")
    
    if not os.path.exists(agent_logs_folder):
        return {}
    
    agent_logs = {}
    
    # 加载每个agent的简化日志
    for persona_name in personas:
        simplified_file = os.path.join(agent_logs_folder, f"{persona_name}_simplified.json")
        if os.path.exists(simplified_file):
            with open(simplified_file, "r", encoding="utf-8") as f:
                agent_logs[persona_name] = json.load(f)
    
    return agent_logs


@app.route("/", methods=['GET'])
def index():
    name = request.args.get("name", "")          # 记录名称
    step = int(request.args.get("step", 0))      # 回放起始步数
    speed = int(request.args.get("speed", 2))    # 回放速度（0~5）
    zoom = float(request.args.get("zoom", 0.8))  # 画面缩放比例
    scene = request.args.get("scene", "")         # 场景名称（如：cafe, park, classroom等）

    if len(name) > 0:
        compressed_folder = os.path.join(BASE_DIR, "results/compressed", name)
    else:
        return f"Invalid name of the simulation: '{name}'"

    replay_file = os.path.join(compressed_folder, file_movement)
    if not os.path.exists(replay_file):
        return f"The data file doesn‘t exist: '{replay_file}'<br />Run compress.py to generate the data first."

    with open(replay_file, "r", encoding="utf-8") as f:
        params = json.load(f)

    if step < 1:
        step = 1
    if step > 1:
        # 重新设置回放的起始时间
        t = datetime.fromisoformat(params["start_datetime"])
        dt = t + timedelta(minutes=params["stride"]*(step-1))
        params["start_datetime"] = dt.isoformat()
        step = (step-1) * frames_per_step + 1
        if step >= len(params["all_movement"]):
            step = len(params["all_movement"])-1

        # 重新设置Agent的初始位置
        for agent in params["persona_init_pos"].keys():
            persona_init_pos = params["persona_init_pos"]
            persona_step_pos = params["all_movement"][f"{step}"]
            persona_init_pos[agent] = persona_step_pos[agent]["movement"]

    if speed < 0:
        speed = 0
    elif speed > 5:
        speed = 5
    speed = 2 ** speed

    # 加载agent日志数据
    agent_logs = load_agent_logs(name)

    return render_template(
        "index.html",
        persona_names=personas,
        step=step,
        play_speed=speed,
        zoom=zoom,
        scene=scene,
        agent_logs=agent_logs,
        **params
    )


@app.route("/api/agent_logs/<name>", methods=['GET'])
def get_agent_logs(name):
    """API端点：获取agent日志数据"""
    agent_logs = load_agent_logs(name)
    return jsonify(agent_logs)


if __name__ == "__main__":
    app.run(debug=True)
