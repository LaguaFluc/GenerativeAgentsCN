/**
 * Phaser游戏配置模块
 * 负责Phaser游戏的配置和初始化
 */

/**
 * 创建Phaser游戏配置对象
 * @param {Object} config - 配置参数
 * @param {number} config.zoom - 缩放比例
 * @param {Function} config.preload - preload函数
 * @param {Function} config.create - create函数
 * @param {Function} config.update - update函数
 * @returns {Object} Phaser游戏配置对象
 */
export function createGameConfig(config) {
	const { zoom, preload, create, update } = config;
	
	return {
		type: Phaser.AUTO,
		width: document.documentElement.clientWidth / zoom,
		height: document.documentElement.clientHeight / zoom,
		parent: "game-container",
		mode: Phaser.Scale.FIT,
		pixelArt: true,
		physics: {
			default: "arcade",
			arcade: {
				gravity: { y: 0 }
			}
		},
		scene: {
			preload: preload,
			create: create,
			update: update
		},
		scale: {
			zoom: zoom
		}
	};
}

