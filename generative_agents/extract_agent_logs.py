#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
从simulate-*.json文件中提取每个agent的阶段性信息
为每个agent创建单独的时间段日志文件
"""

import os
import json
import argparse
from collections import defaultdict
from datetime import datetime


def extract_agent_info_from_checkpoint(checkpoint_file):
    """
    从checkpoint文件中提取所有agent的信息
    
    Args:
        checkpoint_file: checkpoint文件路径
        
    Returns:
        tuple: (timestamp, agents_data) 其中agents_data是字典，key为agent名称
    """
    with open(checkpoint_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    timestamp = data.get("time", "")
    step = data.get("step", 0)
    agents_data = {}
    
    if "agents" in data:
        for agent_name, agent_info in data["agents"].items():
            # 提取关键信息
            agent_log = {
                "timestamp": timestamp,
                "step": step,
                "status": agent_info.get("status", {}),
                "currently": agent_info.get("currently", ""),
                "action": agent_info.get("action", {}),
                "coord": agent_info.get("coord", []),
                "schedule": agent_info.get("schedule", {}),
                "chats": agent_info.get("chats", []),
            }
            agents_data[agent_name] = agent_log
    
    return timestamp, agents_data


def extract_agent_logs(checkpoints_folder, output_folder=None):
    """
    从checkpoints文件夹中提取所有agent的日志
    
    Args:
        checkpoints_folder: checkpoints文件夹路径
        output_folder: 输出文件夹路径，如果为None则使用checkpoints_folder/agent_logs
    """
    if output_folder is None:
        output_folder = os.path.join(checkpoints_folder, "agent_logs")
    
    os.makedirs(output_folder, exist_ok=True)
    
    # 获取所有simulate-*.json文件
    checkpoint_files = []
    for file_name in os.listdir(checkpoints_folder):
        if file_name.startswith("simulate-") and file_name.endswith(".json"):
            file_path = os.path.join(checkpoints_folder, file_name)
            checkpoint_files.append(file_path)
    
    # 按文件名排序（即按时间排序）
    checkpoint_files.sort()
    
    if len(checkpoint_files) == 0:
        print(f"在 {checkpoints_folder} 中未找到simulate-*.json文件")
        return
    
    print(f"找到 {len(checkpoint_files)} 个checkpoint文件")
    
    # 存储每个agent的所有时间段数据
    agent_logs = defaultdict(list)
    
    # 提取每个checkpoint文件中的agent信息
    for checkpoint_file in checkpoint_files:
        try:
            timestamp, agents_data = extract_agent_info_from_checkpoint(checkpoint_file)
            for agent_name, agent_info in agents_data.items():
                agent_logs[agent_name].append(agent_info)
            print(f"已处理: {os.path.basename(checkpoint_file)} (时间: {timestamp})")
        except Exception as e:
            print(f"处理文件 {checkpoint_file} 时出错: {e}")
            continue
    
    # 为每个agent保存单独的时间段日志文件
    for agent_name, logs in agent_logs.items():
        # 创建agent日志文件（完整版）
        agent_file = os.path.join(output_folder, f"{agent_name}_timeline.json")
        
        # 保存为JSON格式
        with open(agent_file, "w", encoding="utf-8") as f:
            json.dump({
                "agent_name": agent_name,
                "total_steps": len(logs),
                "timeline": logs
            }, f, indent=2, ensure_ascii=False)
        
        # 创建简化版时间线（只包含关键信息）
        simplified_file = os.path.join(output_folder, f"{agent_name}_simplified.json")
        simplified_logs = []
        for log in logs:
            simplified_log = {
                "timestamp": log["timestamp"],
                "step": log["step"],
                "status": log["status"],
                "currently": log["currently"],
                "action_describe": log["action"].get("event", {}).get("describe", "") if log.get("action") else "",
                "location": log["action"].get("event", {}).get("address", [])[-1] if log.get("action") and log["action"].get("event") else "",
                "coord": log["coord"],
                "chats_count": len(log.get("chats", []))
            }
            simplified_logs.append(simplified_log)
        
        with open(simplified_file, "w", encoding="utf-8") as f:
            json.dump({
                "agent_name": agent_name,
                "total_steps": len(logs),
                "timeline": simplified_logs
            }, f, indent=2, ensure_ascii=False)
        
        print(f"已保存 {agent_name} 的日志: {agent_file} ({len(logs)} 个时间段)")
        print(f"  简化版: {simplified_file}")
    
    # 创建汇总文件
    summary_file = os.path.join(output_folder, "summary.json")
    summary = {
        "checkpoints_folder": checkpoints_folder,
        "extraction_time": datetime.now().strftime("%Y%m%d-%H:%M:%S"),
        "total_checkpoints": len(checkpoint_files),
        "agents": {
            agent_name: {
                "total_steps": len(logs),
                "first_timestamp": logs[0]["timestamp"] if logs else "",
                "last_timestamp": logs[-1]["timestamp"] if logs else ""
            }
            for agent_name, logs in agent_logs.items()
        }
    }
    
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n汇总信息已保存: {summary_file}")
    print(f"\n提取完成！共提取了 {len(agent_logs)} 个agent的日志")


def main():
    parser = argparse.ArgumentParser(description="从checkpoint文件中提取每个agent的阶段性信息")
    parser.add_argument(
        "--checkpoints",
        type=str,
        required=True,
        help="checkpoints文件夹路径 (例如: results/checkpoints/sim-5-agent-6h)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="输出文件夹路径 (默认: checkpoints_folder/agent_logs)"
    )
    
    args = parser.parse_args()
    
    if not os.path.exists(args.checkpoints):
        print(f"错误: checkpoints文件夹不存在: {args.checkpoints}")
        return
    
    extract_agent_logs(args.checkpoints, args.output)


if __name__ == "__main__":
    main()

