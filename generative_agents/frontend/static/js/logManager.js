/**
 * 日志管理模块
 * 负责角色日志的显示、更新和管理
 */

import { formatTimestamp } from './utils.js';

/**
 * 更新右侧容器的日志显示
 * @param {string} agentName - 角色名称
 * @param {Object} agentLogsData - 角色日志数据
 * @param {Date} currentTime - 当前时间
 * @param {HTMLElement} rightContainer - 右侧容器DOM元素
 */
export function updateRightContainerLogs(agentName, agentLogsData, currentTime, rightContainer) {
	if (!agentLogsData || !agentLogsData[agentName] || !agentLogsData[agentName].timeline) {
		rightContainer.innerHTML = '<div style="line-height:1.8;padding:10px;">未找到该角色的日志数据。</div>';
		return;
	}

	let timeline = agentLogsData[agentName].timeline;
	let currentTimestamp = formatTimestamp(currentTime);
	
	let logsText = `<div style="line-height:1.8;">`;
	logsText += `<p style="margin-top:0;"><strong>当前时间:</strong> ${currentTimestamp}</p>`;
	logsText += `<p><strong>开始时间:</strong> ${timeline[0] ? timeline[0].timestamp : "未知"}</p>`;
	logsText += `<hr style="border:1px solid #eee;margin:15px 0;">`;
	
	// 过滤并显示当前时间之前的日志
	for (let i = 0; i < timeline.length; i++) {
		let log = timeline[i];
		if (log.timestamp <= currentTimestamp) {
			logsText += `<div style="margin-bottom:20px;">`;
			logsText += `<p><strong>[${log.timestamp}] Step ${log.step}</strong></p>`;
			logsText += `<p>位置: ${log.location || "未知"}</p>`;
			logsText += `<p>活动: ${log.action_describe || "无"}</p>`;
			logsText += `<p>状态: ${log.currently || "无"}</p>`;
			if (log.chats_count > 0) {
				logsText += `<p>对话数: ${log.chats_count}</p>`;
			}
			logsText += `</div>`;
			logsText += `<hr style="border:1px solid #eee;margin:15px 0;">`;
		}
	}
	logsText += `</div>`;
	
	rightContainer.innerHTML = logsText;
}

/**
 * 更新游戏内的代理日志显示（用于Phaser场景中的文本对象）
 * @param {string} agentName - 角色名称
 * @param {Object} agentLogsData - 角色日志数据
 * @param {Date} startDatetime - 开始时间
 * @param {Phaser.GameObjects.Container} textAgentLogs - Phaser文本容器对象
 */
export function updateAgentLogs(agentName, agentLogsData, startDatetime, textAgentLogs) {
	if (!agentLogsData[agentName] || !agentLogsData[agentName].timeline) {
		textAgentLogs.updateText("未找到该角色的日志数据。");
		return;
	}

	let timeline = agentLogsData[agentName].timeline;
	let currentTimestamp = formatTimestamp(startDatetime);
	
	let logsText = `=== ${agentName} 的日志 ===\n\n`;
	logsText += `[返回] - 点击返回角色列表\n\n`;
	logsText += `当前时间: ${currentTimestamp}\n`;
	logsText += `开始时间: ${timeline[0] ? timeline[0].timestamp : "未知"}\n\n`;
	logsText += "─────────────────────────────\n\n";
	
	// Filter logs up to current time
	for (let i = 0; i < timeline.length; i++) {
		let log = timeline[i];
		if (log.timestamp <= currentTimestamp) {
			logsText += `[${log.timestamp}] Step ${log.step}\n`;
			logsText += `位置: ${log.location || "未知"}\n`;
			logsText += `活动: ${log.action_describe || "无"}\n`;
			logsText += `状态: ${log.currently || "无"}\n`;
			if (log.chats_count > 0) {
				logsText += `对话数: ${log.chats_count}\n`;
			}
			logsText += "\n─────────────────────────────\n\n";
		}
	}
	
	textAgentLogs.updateText(logsText);
}

/**
 * 更新代理列表显示
 * @param {Object} agentLogsData - 角色日志数据
 * @param {Phaser.GameObjects.Container} textAgentList - Phaser文本容器对象
 */
export function updateAgentList(agentLogsData, textAgentList) {
	let listText = "请选择要查看日志的角色：\n\n";
	let agentCount = 0;
	for (let agentName in agentLogsData) {
		if (agentLogsData[agentName] && agentLogsData[agentName].timeline) {
			listText += `[${agentName}] - 点击查看日志\n`;
			agentCount++;
		}
	}
	
	if (agentCount === 0) {
		listText += "暂无可用的日志数据。\n";
	}
	
	textAgentList.updateText(listText);
}

