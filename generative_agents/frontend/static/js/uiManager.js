/**
 * UI管理模块
 * 负责创建和管理用户界面元素，包括按钮、容器、浮层等
 */

/**
 * 创建并初始化UI元素
 * @param {Object} config - 配置对象
 * @param {Function} onAgentSelect - 角色选择回调函数
 * @returns {Object} UI元素对象
 */
export function createUIElements(config, onAgentSelect) {
	const { agentLogsData, startDatetime } = config;
	
	// 创建左侧【人物日志】按钮
	const btnLog = document.createElement('button');
	btnLog.textContent = '【人物日志】';
	btnLog.style.cssText = 'position:fixed;left:20px;top:20px;padding:10px 20px;font-size:16px;cursor:pointer;z-index:1001;background:#fff;border:1px solid #ddd;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);';
	btnLog.onmouseenter = () => btnLog.style.background = '#f5f5f5';
	btnLog.onmouseleave = () => btnLog.style.background = '#fff';
	document.body.appendChild(btnLog);

	// 创建全屏遮罩层（初始隐藏）
	const overlay = document.createElement('div');
	overlay.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1002;display:none;opacity:0;transition:opacity 0.3s ease;';
	document.body.appendChild(overlay);

	// 创建下拉菜单容器（初始隐藏）
	const dropdownMenu = document.createElement('div');
	dropdownMenu.style.cssText = 'position:fixed;left:20px;top:60px;background:#fff;border:1px solid #ddd;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1003;display:none;min-width:200px;max-height:400px;overflow-y:auto;';
	document.body.appendChild(dropdownMenu);

	// 创建日志容器（白色容器，初始隐藏）
	const logContainer = document.createElement('div');
	logContainer.style.cssText = 'position:fixed;right:50%;top:50%;transform:translate(50%,-50%);width:calc(50% - 48px);max-width:800px;height:calc(80vh - 48px);max-height:600px;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.2);z-index:1004;display:none;opacity:0;transition:opacity 0.3s ease;flex-direction:column;';
	document.body.appendChild(logContainer);

	// 创建容器标题栏
	const titleBar = document.createElement('div');
	titleBar.style.cssText = 'padding:16px 20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';
	logContainer.appendChild(titleBar);

	// 创建标题文本
	const titleText = document.createElement('h3');
	titleText.style.cssText = 'margin:0;font-size:18px;font-weight:600;color:#333;';
	titleText.textContent = '人物日志';
	titleBar.appendChild(titleText);

	// 创建关闭按钮（×）
	const closeBtn = document.createElement('button');
	closeBtn.innerHTML = '×';
	closeBtn.style.cssText = 'background:none;border:none;font-size:28px;line-height:1;color:#999;cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all 0.2s;';
	closeBtn.onmouseenter = () => {
		closeBtn.style.color = '#333';
		closeBtn.style.background = '#f5f5f5';
	};
	closeBtn.onmouseleave = () => {
		closeBtn.style.color = '#999';
		closeBtn.style.background = 'none';
	};
	titleBar.appendChild(closeBtn);

	// 创建日志内容区域（可滚动）
	const logContent = document.createElement('div');
	logContent.style.cssText = 'flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;box-sizing:border-box;';
	logContainer.appendChild(logContent);

	// 关闭日志容器的函数
	const closeLogContainer = () => {
		logContainer.style.opacity = '0';
		overlay.style.opacity = '0';
		setTimeout(() => {
			logContainer.style.display = 'none';
			overlay.style.display = 'none';
		}, 300); // 等待动画完成
	};

	// 显示日志容器的函数
	const showLogContainer = (agentName) => {
		// 更新标题
		titleText.textContent = `${agentName} - 日志`;
		// 显示遮罩和容器
		overlay.style.display = 'block';
		logContainer.style.display = 'flex'; // 使用 flex 布局
		// 触发淡入动画
		setTimeout(() => {
			overlay.style.opacity = '1';
			logContainer.style.opacity = '1';
		}, 10);
	};

	// 关闭按钮点击事件
	closeBtn.onclick = (e) => {
		e.stopPropagation();
		closeLogContainer();
	};

	// 遮罩点击事件：关闭日志容器
	overlay.onclick = () => {
		closeLogContainer();
	};

	// 阻止日志容器内的点击事件冒泡到遮罩
	logContainer.onclick = (e) => {
		e.stopPropagation();
	};

	// 按钮点击事件：显示下拉菜单
	btnLog.onclick = (e) => {
		e.stopPropagation();
		// 切换下拉菜单显示状态
		if (dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '') {
			// 清空列表并重新生成
			dropdownMenu.innerHTML = '';
			
			// 从agent_logs_data中获取可用角色列表
			let agents = [];
			if (agentLogsData) {
				for (let name in agentLogsData) {
					if (agentLogsData[name] && agentLogsData[name].timeline) {
						agents.push(name);
					}
				}
			}
			
			// 如果没有可用角色，显示提示
			if (agents.length === 0) {
				const emptyMsg = document.createElement('div');
				emptyMsg.textContent = '暂无可用的日志数据';
				emptyMsg.style.cssText = 'padding:15px;color:#999;text-align:center;';
				dropdownMenu.appendChild(emptyMsg);
			} else {
				// 创建人物列表项
				agents.forEach(name => {
					const item = document.createElement('div');
					item.textContent = name;
					item.style.cssText = 'padding:12px 16px;border-bottom:1px solid #eee;cursor:pointer;transition:background 0.2s;font-size:14px;';
					item.onmouseenter = () => item.style.background = '#f5f5f5';
					item.onmouseleave = () => item.style.background = '#fff';
					item.onclick = (e) => {
						e.stopPropagation();
						// 隐藏下拉菜单
						dropdownMenu.style.display = 'none';
						// 显示日志容器
						showLogContainer(name);
						// 触发回调
						if (onAgentSelect) {
							onAgentSelect(name);
						}
					};
					dropdownMenu.appendChild(item);
				});
			}
			
			dropdownMenu.style.display = 'block';
		} else {
			dropdownMenu.style.display = 'none';
		}
	};

	// 点击页面其他地方时关闭下拉菜单
	document.addEventListener('click', (e) => {
		if (!btnLog.contains(e.target) && !dropdownMenu.contains(e.target)) {
			dropdownMenu.style.display = 'none';
		}
	});

	return {
		btnLog,
		rightContainer: logContent, // 返回日志内容区域，保持与原有代码的兼容性
		overlay,
		listContainer: dropdownMenu,
		logContainer, // 新增：返回完整的日志容器
		titleText, // 新增：返回标题文本元素，方便更新
		closeLogContainer // 新增：返回关闭函数，供外部调用
	};
}

