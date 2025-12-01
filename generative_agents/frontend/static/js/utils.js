/**
 * 工具函数模块
 * 提供通用的辅助函数，如日期格式化等
 */

/**
 * 格式化时间戳函数（用于匹配日志格式）
 * @param {Date} date - 要格式化的日期对象
 * @returns {string} 格式化后的时间戳字符串 (YYYYMMDD-HH:MM)
 */
export function formatTimestamp(date) {
	if (!date) return '';
	let year = date.getFullYear();
	let month = String(date.getMonth() + 1).padStart(2, '0');
	let day = String(date.getDate()).padStart(2, '0');
	let hour = String(date.getHours()).padStart(2, '0');
	let minute = String(date.getMinutes()).padStart(2, '0');
	return `${year}${month}${day}-${hour}:${minute}`;
}

/**
 * 创建可滚动的文本容器（用于Phaser游戏场景）
 * @param {Phaser.Scene} game - Phaser游戏场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} text - 初始文本内容
 * @param {string} background - 背景颜色（未使用，保留兼容性）
 * @param {number} maxHeight - 最大高度
 * @param {number} boxWidth - 容器宽度
 * @param {number} zoom - 缩放比例
 * @returns {Phaser.GameObjects.Container} 可滚动的文本容器
 */
export function addScrollableText(game, x, y, text, background, maxHeight, boxWidth, zoom = 1) {
	maxHeight = maxHeight || 400;
	boxWidth = boxWidth || (1200 / zoom);
	
	// Create a container for scrollable text
	let container = game.add.container(x, y);
	container.setDepth(11);
	container.setScrollFactor(0);
	
	// Create background rectangle with more visible styling
	let bg = game.add.rectangle(0, 0, boxWidth, maxHeight, 0xffffff, 0.95);
	bg.setStrokeStyle(3, 0x333333); // Thicker, darker border
	bg.setOrigin(0, 0);
	container.add(bg);
	
	// Create text object with proper positioning
	let textObj = game.add.text(
		20,
		20,
		text,
		{
			font: "18px 黑体",
			fontWeight: "normal",
			fill: "#000000",
			align: "left",
			wordWrap: { width: boxWidth - 40, useAdvancedWrap: true },
		}
	);
	textObj.setOrigin(0, 0);
	container.add(textObj);
	
	// Add scroll functionality
	let scrollY = 0;
	let updateMaxScroll = function() {
		let textHeight = textObj.height;
		return Math.max(0, textHeight - maxHeight + 40);
	};
	let maxScroll = updateMaxScroll();
	
	// Make container interactive for scrolling
	container.setInteractive(new Phaser.Geom.Rectangle(0, 0, boxWidth, maxHeight), Phaser.Geom.Rectangle.Contains);
	container.on('wheel', function(pointer, gameObjects, deltaX, deltaY, deltaZ) {
		if (container.visible) {
			scrollY += deltaY * 0.5;
			maxScroll = updateMaxScroll();
			scrollY = Phaser.Math.Clamp(scrollY, -maxScroll, 0);
			textObj.y = 20 + scrollY;
		}
	});
	
	// Store references and update function
	container.textObj = textObj;
	container.bg = bg;
	container.maxHeight = maxHeight;
	container.boxWidth = boxWidth;
	container.updateText = function(newText) {
		this.textObj.setText(newText);
		maxScroll = updateMaxScroll();
		scrollY = Phaser.Math.Clamp(scrollY, -maxScroll, 0);
		this.textObj.y = 20 + scrollY;
	};
	
	return container;
}

/**
 * 创建文本对象（用于Phaser游戏场景）
 * @param {Phaser.Scene} game - Phaser游戏场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} text - 文本内容
 * @param {string} background - 背景颜色
 * @param {number} zoom - 缩放比例
 * @returns {Phaser.GameObjects.Text} 文本对象
 */
export function addText(game, x, y, text, background, zoom = 1) {
	let res = game.add.text(
		x,
		y,
		text,
		{
			font: "24px 黑体",
			fontWeight: "normal",
			fill: "#000000",
			backgroundColor: background,
			padding: { x: 20, y: 4},
			align: "left",
			wordWrap: { width: 1200 / zoom, useAdvancedWrap: true },
		}
	);

	res.setDepth(10);
	res.alpha = 0.8;
	res.setScrollFactor(0);

	return res;
}

