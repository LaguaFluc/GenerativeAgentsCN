/**
 * 主入口模块
 * 负责初始化应用程序、协调各个模块
 */

import { createUIElements } from './uiManager.js';
import { createGameConfig } from './gameConfig.js';
import { createGameScene } from './gameScene.js';
import { updateRightContainerLogs } from './logManager.js';

/**
 * 初始化应用程序
 * @param {Object} config - 配置对象，包含从Flask模板传入的所有变量
 */
export function initApp(config) {
	const {
		step,
		secPerStep,
		zoom,
		playSpeed,
		allMovement,
		startDatetime,
		agentLogs,
		personaInitPos
	} = config;

	// 计算和初始化变量
	let stepSize = secPerStep * 1000; // Convert to milliseconds
	let actualZoom = zoom;
	if (actualZoom <= 0) {
		actualZoom = document.documentElement.clientWidth / 4400;
	}

	let tileWidth = 32;
	let movementSpeed = playSpeed;
	let agentLogsData = agentLogs || {};
	let personaNames = personaInitPos;
	let datetimeOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
	let startDatetimeObj = new Date(Date.parse(startDatetime));

	// 全局变量：当前选中的角色（用于右侧容器）
	let currentSelectedAgent = null;
	let startDatetimeTemp = startDatetimeObj;

	// 创建UI元素
	const uiElements = createUIElements(
		{
			agentLogsData: agentLogsData,
			startDatetime: startDatetimeObj
		},
		(agentName) => {
			// 角色选择回调
			currentSelectedAgent = agentName;
			// 立即更新右侧容器
			updateRightContainerLogs(agentName, agentLogsData, startDatetimeTemp || startDatetimeObj, uiElements.rightContainer);
			uiElements.rightContainer.scrollTop = 0;
		}
	);

	// 准备游戏状态对象
	const gameState = {
		step: step,
		zoom: actualZoom,
		personaNames: personaNames,
		tileWidth: tileWidth,
		movementSpeed: movementSpeed,
		agentLogsData: agentLogsData,
		allMovement: allMovement,
		stepSize: stepSize,
		startDatetime: startDatetimeObj,
		datetimeOptions: datetimeOptions,
		onTimeUpdate: (newDatetime) => {
			// 时间更新回调
			startDatetimeTemp = newDatetime;
			// 更新右侧容器（如果已选中角色）
			if (currentSelectedAgent && uiElements.rightContainer) {
				updateRightContainerLogs(currentSelectedAgent, agentLogsData, newDatetime, uiElements.rightContainer);
			}
		},
		onAgentLogUpdate: (newDatetime) => {
			// 代理日志更新回调（用于游戏内日志显示）
			startDatetimeTemp = newDatetime;
		}
	};

	// 创建游戏场景
	const scene = createGameScene(gameState);

	// 创建Phaser游戏配置
	const phaserConfig = createGameConfig({
		zoom: actualZoom,
		preload: scene.preload,
		create: scene.create,
		update: scene.update
	});

	// 创建Phaser游戏实例
	const game = new Phaser.Game(phaserConfig);

	// 返回游戏实例和UI元素，以便外部访问（如果需要）
	return {
		game,
		uiElements,
		currentSelectedAgent: () => currentSelectedAgent,
		setCurrentSelectedAgent: (name) => { currentSelectedAgent = name; }
	};
}

