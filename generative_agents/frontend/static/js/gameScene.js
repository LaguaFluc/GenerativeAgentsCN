/**
 * Phaser游戏场景模块
 * 负责游戏场景的preload、create和update逻辑
 */

import { addText, addScrollableText } from './utils.js';
import { updateAgentLogs, updateAgentList } from './logManager.js';

/**
 * 创建游戏场景对象
 * @param {Object} gameState - 游戏状态对象（包含所有需要共享的变量）
 * @returns {Object} 包含preload、create、update函数的场景对象
 */
export function createGameScene(gameState) {
	const {
		zoom,
		personaNames,
		tileWidth,
		movementSpeed,
		agentLogsData,
		allMovement,
		stepSize,
		datetimeOptions,
		onTimeUpdate,
		onAgentLogUpdate
	} = gameState;

	// 场景函数需要访问这些状态
	let game, player, cursors;
	let personas = {};
	let pronunciatios = {};
	let animsDirection;
	let preAnimsDirection;
	let preAnimsDirectionDict = {};
	let movementTarget = {};
	let finished = false;
	let paused = false;
	let executeCountMax = tileWidth / movementSpeed;
	let executeCount = executeCountMax;
	let step = gameState.step;
	let startDatetime = gameState.startDatetime;
	let showAgentLogs = false;
	let selectedAgent = null;
	let buttonPlay, buttonPause, buttonShowConversation, buttonHideConversation;
	let buttonShowAgentLogs, buttonHideAgentLogs;
	let currentTime, textConversation, textAgentList, textAgentLogs;

	function preload() {
		this.load.crossOrigin = "";

		// Load images
		this.load.image("blocks_1", "static/assets/village/tilemap/blocks_1.png");
		this.load.image("walls", "static/assets/village/tilemap/Room_Builder_32x32.png");
		this.load.image("interiors_pt1", "static/assets/village/tilemap/interiors_pt1.png");
		this.load.image("interiors_pt2", "static/assets/village/tilemap/interiors_pt2.png");
		this.load.image("interiors_pt3", "static/assets/village/tilemap/interiors_pt3.png");
		this.load.image("interiors_pt4", "static/assets/village/tilemap/interiors_pt4.png");
		this.load.image("interiors_pt5", "static/assets/village/tilemap/interiors_pt5.png");
		this.load.image("CuteRPG_Field_B", "static/assets/village/tilemap/CuteRPG_Field_B.png");
		this.load.image("CuteRPG_Field_C", "static/assets/village/tilemap/CuteRPG_Field_C.png");
		this.load.image("CuteRPG_Harbor_C", "static/assets/village/tilemap/CuteRPG_Harbor_C.png");
		this.load.image("CuteRPG_Village_B", "static/assets/village/tilemap/CuteRPG_Village_B.png");
		this.load.image("CuteRPG_Forest_B", "static/assets/village/tilemap/CuteRPG_Forest_B.png");
		this.load.image("CuteRPG_Desert_C", "static/assets/village/tilemap/CuteRPG_Desert_C.png");
		this.load.image("CuteRPG_Mountains_B", "static/assets/village/tilemap/CuteRPG_Mountains_B.png");
		this.load.image("CuteRPG_Desert_B", "static/assets/village/tilemap/CuteRPG_Desert_B.png");
		this.load.image("CuteRPG_Forest_C", "static/assets/village/tilemap/CuteRPG_Forest_C.png");

		// Load tilemap JSON
		this.load.tilemapTiledJSON("map", "static/assets/village/tilemap/tilemap.json");

		this.load.atlas("atlas", "static/assets/village/agents/苏沐晴/texture.png", "static/assets/village/agents/sprite.json");

		// Load persona atlases
		for (var p in personaNames) {
			let imageStatic = "static/assets/village/agents/" + p + "/texture.png";
			this.load.atlas(p, imageStatic, "static/assets/village/agents/sprite.json");
		}
	}

	function create() {
		game = this.game;
		const map = this.make.tilemap({ key: "map" });

		// Add tilesets and layers
		const collisions = map.addTilesetImage("blocks", "blocks_1");
		const walls = map.addTilesetImage("Room_Builder_32x32", "walls");
		const interiors_pt1 = map.addTilesetImage("interiors_pt1", "interiors_pt1");
		const interiors_pt2 = map.addTilesetImage("interiors_pt2", "interiors_pt2");
		const interiors_pt3 = map.addTilesetImage("interiors_pt3", "interiors_pt3");
		const interiors_pt4 = map.addTilesetImage("interiors_pt4", "interiors_pt4");
		const interiors_pt5 = map.addTilesetImage("interiors_pt5", "interiors_pt5");
		const CuteRPG_Field_B = map.addTilesetImage("CuteRPG_Field_B", "CuteRPG_Field_B");
		const CuteRPG_Field_C = map.addTilesetImage("CuteRPG_Field_C", "CuteRPG_Field_C");
		const CuteRPG_Harbor_C = map.addTilesetImage("CuteRPG_Harbor_C", "CuteRPG_Harbor_C");
		const CuteRPG_Village_B = map.addTilesetImage("CuteRPG_Village_B", "CuteRPG_Village_B");
		const CuteRPG_Forest_B = map.addTilesetImage("CuteRPG_Forest_B", "CuteRPG_Forest_B");
		const CuteRPG_Desert_C = map.addTilesetImage("CuteRPG_Desert_C", "CuteRPG_Desert_C");
		const CuteRPG_Mountains_B = map.addTilesetImage("CuteRPG_Mountains_B", "CuteRPG_Mountains_B");
		const CuteRPG_Desert_B = map.addTilesetImage("CuteRPG_Desert_B", "CuteRPG_Desert_B");
		const CuteRPG_Forest_C = map.addTilesetImage("CuteRPG_Forest_C", "CuteRPG_Forest_C");

		let tilesetGroup1 = [CuteRPG_Field_B, CuteRPG_Field_C, CuteRPG_Harbor_C, CuteRPG_Village_B,
			CuteRPG_Forest_B, CuteRPG_Desert_C, CuteRPG_Mountains_B, CuteRPG_Desert_B, CuteRPG_Forest_C,
			interiors_pt1, interiors_pt2, interiors_pt3, interiors_pt4, interiors_pt5, walls];
		map.createLayer("Bottom Ground", tilesetGroup1, 0, 0);
		map.createLayer("Exterior Ground", tilesetGroup1, 0, 0);
		map.createLayer("Exterior Decoration L1", tilesetGroup1, 0, 0);
		map.createLayer("Exterior Decoration L2", tilesetGroup1, 0, 0);
		map.createLayer("Interior Ground", tilesetGroup1, 0, 0);
		map.createLayer("Wall", [CuteRPG_Field_C, walls], 0, 0);
		map.createLayer("Interior Furniture L1", tilesetGroup1, 0, 0);
		map.createLayer("Interior Furniture L2 ", tilesetGroup1, 0, 0);
		const foregroundL1Layer = map.createLayer("Foreground L1", tilesetGroup1, 0, 0);
		const foregroundL2Layer = map.createLayer("Foreground L2", tilesetGroup1, 0, 0);

		const collisionsLayer = map.createLayer("Collisions", collisions, 0, 0);
		collisionsLayer.setCollisionByProperty({ collide: true });
		collisionsLayer.setDepth(-1);
		foregroundL1Layer.setDepth(2);
		foregroundL2Layer.setDepth(2);

		const canvas = game.canvas;
		canvas.addEventListener("wheel", (event) => {
			event.stopPropagation();
		}, { passive: false, capture: true });

		let posX = 20;
		let posY = 20;

		// Add button: play, pause ...
		buttonPlay = addText(this, posX, posY, "[运行]", "#ffffcc", zoom);
		buttonPlay.setInteractive();
		posX += buttonPlay.width + 10;

		buttonPause = addText(this, posX, posY, " 暂停 ", "#ffffcc", zoom);
		buttonPause.setInteractive();
		posX += buttonPause.width + 10;

		buttonShowConversation = addText(this, posX, posY, "[显示对话]", "#ffffcc", zoom);
		buttonShowConversation.setInteractive();
		posX += buttonShowConversation.width + 10;

		buttonHideConversation = addText(this, posX, posY, " 隐藏对话 ", "#ffffcc", zoom);
		buttonHideConversation.setInteractive();
		posX += buttonHideConversation.width + 10;

		buttonShowAgentLogs = addText(this, posX, posY, "[人物日志]", "#ffffcc", zoom);
		buttonShowAgentLogs.setInteractive();
		posX += buttonShowAgentLogs.width + 10;

		buttonHideAgentLogs = addText(this, posX, posY, " 隐藏日志 ", "#ffffcc", zoom);
		buttonHideAgentLogs.setInteractive();
		posX += buttonHideAgentLogs.width + 10;

		// Show current time
		currentTime = addText(this, posX, posY, "", "#ccffcc", zoom);

		// Show conversation content
		textConversation = addText(this, 20, posY + currentTime.height + 10, " —— ", "#ccffcc", zoom);

		// Calculate position for agent logs (to the right of conversation box)
		let conversationBoxWidth = 1200 / zoom;
		let spacing = 20;
		let logsBoxX = 20 + conversationBoxWidth + spacing;
		
		// Calculate available width for logs box
		let screenWidth = document.documentElement.clientWidth / zoom;
		let logsBoxWidth = Math.min(1200 / zoom, screenWidth - logsBoxX - 20);
		
		// Show agent list (for selecting agent to view logs)
		textAgentList = addScrollableText(this, logsBoxX, posY + currentTime.height + 10, " —— ", "#ccffff", 500, logsBoxWidth, zoom);
		textAgentList.setVisible(false);

		// Show agent logs content (scrollable)
		textAgentLogs = addScrollableText(this, logsBoxX, posY + currentTime.height + 10, " —— ", "#ffffcc", 500, logsBoxWidth, zoom);
		textAgentLogs.setVisible(false);

		// Handle agent selection - make agent names clickable
		textAgentList.setInteractive(new Phaser.Geom.Rectangle(0, 0, logsBoxWidth, 500), Phaser.Geom.Rectangle.Contains);
		textAgentList.on("pointerdown", function(pointer) {
			if (selectedAgent !== null) return;
			
			let localX = pointer.x - textAgentList.x;
			let localY = pointer.y - textAgentList.y;
			
			if (localX >= 0 && localX <= logsBoxWidth && localY >= 0 && localY <= 500) {
				let agentNames = Object.keys(agentLogsData || {}).filter(name => 
					agentLogsData[name] && agentLogsData[name].timeline
				);
				
				if (localY > 20 && localY < 20 + agentNames.length * 40) {
					let agentIndex = Math.floor((localY - 20) / 40);
					
					if (agentIndex >= 0 && agentIndex < agentNames.length) {
						selectedAgent = agentNames[agentIndex];
						textAgentList.setVisible(false);
						textAgentLogs.setVisible(true);
						updateAgentLogs(selectedAgent, agentLogsData, startDatetime, textAgentLogs);
					}
				}
			}
		});

		// Handle back button in logs view
		textAgentLogs.setInteractive(new Phaser.Geom.Rectangle(0, 0, logsBoxWidth, 500), Phaser.Geom.Rectangle.Contains);
		textAgentLogs.on("pointerdown", function(pointer) {
			if (selectedAgent === null) return;
			
			let localX = pointer.x - textAgentLogs.x;
			let localY = pointer.y - textAgentLogs.y;
			
			if (localX >= 0 && localX <= logsBoxWidth && localY >= 0 && localY <= 500) {
				if (localY > 0 && localY < 60) {
					selectedAgent = null;
					textAgentList.setVisible(true);
					textAgentLogs.setVisible(false);
					updateAgentList(agentLogsData, textAgentList);
				}
			}
		});

		// Setup camera
		player = this.physics.add.sprite(2440, 500, "atlas", "down").setSize(30, 40).setOffset(0, 0);
		player.setDepth(-1);
		const camera = this.cameras.main;
		camera.startFollow(player);
		camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		cursors = this.input.keyboard.createCursorKeys();

		// Setup personas
		let spawnTileLoc = {};
		for (var key in personaNames) {
			spawnTileLoc[key] = personaNames[key];
		}

		for (let i = 0; i < Object.keys(spawnTileLoc).length; i++) {
			let personaName = Object.keys(spawnTileLoc)[i];
			let startPos = [spawnTileLoc[personaName][0] * tileWidth + tileWidth / 2, spawnTileLoc[personaName][1] * tileWidth + tileWidth];
			let newSprite = this.physics.add.sprite(startPos[0], startPos[1], personaName, "down").setSize(30, 40).setOffset(0, 0);
			newSprite.displayWidth = 40;
			newSprite.scaleY = newSprite.scaleX;

			personas[personaName] = newSprite;
			pronunciatios[personaName] = this.add.text(
				newSprite.body.x - 15,
				newSprite.body.y - 15 - 25,
				"",
				{
					font: "18px monospace",
					fill: "#000000",
					backgroundColor: "#ffffcc",
					padding: { x: 4, y: 4},
					border:"solid",
					borderRadius:"10px"
				}
			).setDepth(3);
			pronunciatios[personaName].alpha = 0.7;
		}

		// Create animations
		const anims = this.anims;
		for (let i = 0; i < Object.keys(personaNames).length; i++) {
			let personaName = Object.keys(personaNames)[i];
			let leftWalkName = personaName + "-left-walk";
			let rightWalkName = personaName + "-right-walk";
			let downWalkName = personaName + "-down-walk";
			let upWalkName = personaName + "-up-walk";

			let frameRate = 4;
			if (movementSpeed > 1) frameRate = 8;

			anims.create({
				key: leftWalkName,
				frames: anims.generateFrameNames(personaName, { prefix: "left-walk.", start: 0, end: 3, zeroPad: 3 }),
				frameRate: frameRate,
				repeat: -1
			});

			anims.create({
				key: rightWalkName,
				frames: anims.generateFrameNames(personaName, { prefix: "right-walk.", start: 0, end: 3, zeroPad: 3 }),
				frameRate: frameRate,
				repeat: -1
			});

			anims.create({
				key: downWalkName,
				frames: anims.generateFrameNames(personaName, { prefix: "down-walk.", start: 0, end: 3, zeroPad: 3 }),
				frameRate: frameRate,
				repeat: -1
			});

			anims.create({
				key: upWalkName,
				frames: anims.generateFrameNames(personaName, { prefix: "up-walk.", start: 0, end: 3, zeroPad: 3 }),
				frameRate: frameRate,
				repeat: -1
			});
		}
	}

	function update(time, delta) {
		// Setup play and pause button
		buttonPlay.on("pointerdown", function() {
			if (finished) return;
			buttonPlay.text = "[运行]";
			buttonPause.text = " 暂停 ";
			paused = false;
		});

		buttonPause.on("pointerdown", function() {
			if (finished) return;
			buttonPlay.text = " 运行 ";
			buttonPause.text = "[暂停]";
			paused = true;
		});

		buttonShowConversation.on("pointerdown", function() {
			buttonShowConversation.text = "[显示对话]";
			buttonHideConversation.text = " 隐藏对话 ";
			textConversation.setVisible(true);
		});

		buttonHideConversation.on("pointerdown", function() {
			buttonShowConversation.text = " 显示对话 ";
			buttonHideConversation.text = "[隐藏对话]";
			textConversation.setVisible(false);
		});

		buttonShowAgentLogs.on("pointerdown", function() {
			buttonShowAgentLogs.text = "[人物日志]";
			buttonHideAgentLogs.text = " 隐藏日志 ";
			showAgentLogs = true;
			selectedAgent = null;
			updateAgentList(agentLogsData, textAgentList);
			textAgentList.setVisible(true);
			textAgentLogs.setVisible(false);
		});

		buttonHideAgentLogs.on("pointerdown", function() {
			buttonShowAgentLogs.text = " 人物日志 ";
			buttonHideAgentLogs.text = "[隐藏日志]";
			showAgentLogs = false;
			selectedAgent = null;
			textAgentList.setVisible(false);
			textAgentLogs.setVisible(false);
		});

		// Move camera
		const cameraSpeed = 400;
		player.body.setVelocity(0);
		if (cursors.left.isDown) {
			player.body.setVelocityX(-cameraSpeed);
		}
		if (cursors.right.isDown) {
			player.body.setVelocityX(cameraSpeed);
		}
		if (cursors.up.isDown) {
			player.body.setVelocityY(-cameraSpeed);
		}
		if (cursors.down.isDown) {
			player.body.setVelocityY(cameraSpeed);
		}

		let currFocusedPersona = document.getElementById("temp_focus");
		if (currFocusedPersona && currFocusedPersona.textContent != "") {
			player.body.x = personas[currFocusedPersona.textContent].body.x;
			player.body.y = personas[currFocusedPersona.textContent].body.y;
			currFocusedPersona.innerHTML = "";
		}

		if (finished || paused) {
			return;
		}

		let currDatetime = new Date(startDatetime.getTime());
		let currYear = currDatetime.getFullYear().toString().padStart(4, "0");
		let currMonth = (currDatetime.getMonth() + 1).toString().padStart(2, "0");
		let currDay = currDatetime.getDate().toString().padStart(2, "0");
		let currHour = currDatetime.getHours().toString().padStart(2, "0");
		let currMinute = currDatetime.getMinutes().toString().padStart(2, "0");
		let conversationKey = `${currYear}${currMonth}${currDay}-${currHour}:${currMinute}`;
		let conversationKeyText = allMovement["conversation"][conversationKey];
		if (conversationKeyText && conversationKeyText != "") {
			textConversation.setText(`\n${conversationKey} 对话记录：\n` + conversationKeyText);
		}

		// Moving personas
		for (let i = 0; i < Object.keys(personas).length; i++) {
			let currPersonaName = Object.keys(personas)[i];
			let currPersona = personas[currPersonaName];
			let currPronunciatio = pronunciatios[currPersonaName];

			if (step in allMovement) {
				if (currPersonaName.replace("_", " ") in allMovement[step]) {
					if (executeCount == executeCountMax) {
						let currX = allMovement[step][currPersonaName.replace("_", " ")]["movement"][0];
						let currY = allMovement[step][currPersonaName.replace("_", " ")]["movement"][1];
						movementTarget[currPersonaName] = [currX * tileWidth, currY * tileWidth];

						let action = allMovement[step][currPersonaName.replace("_", " ")]["action"];

						let act = action;
						act = act.length > 25 ? act.substring(0, 20) + "..." : act;
						pronunciatios[currPersonaName].setText(currPersonaName + ": " + act);

						// Updating the status of each personas
						let agentDescEl = document.getElementById("agent_desc__" + currPersonaName);
						let currentActionEl = document.getElementById("current_action__" + currPersonaName);
						let targetAddressEl = document.getElementById("target_address__" + currPersonaName);
						
						if (agentDescEl) {
							agentDescEl.innerHTML = allMovement["description"][currPersonaName]["currently"];
						}
						if (currentActionEl) {
							currentActionEl.innerHTML = action;
						}
						if (targetAddressEl) {
							targetAddressEl.innerHTML = allMovement[step][currPersonaName.replace("_", " ")]["location"];
						}
					}

					if (executeCount > 0) {
						if (currPersona.body.x < movementTarget[currPersonaName][0]) {
							currPersona.body.x += movementSpeed;
							animsDirection = "r";
							preAnimsDirection = "r";
							preAnimsDirectionDict[currPersonaName] = "r";
						} else if (currPersona.body.x > movementTarget[currPersonaName][0]) {
							currPersona.body.x -= movementSpeed;
							animsDirection = "l";
							preAnimsDirection = "l";
							preAnimsDirectionDict[currPersonaName] = "l";
						} else if (currPersona.body.y < movementTarget[currPersonaName][1]) {
							currPersona.body.y += movementSpeed;
							animsDirection = "d";
							preAnimsDirection = "d";
							preAnimsDirectionDict[currPersonaName] = "d";
						} else if (currPersona.body.y > movementTarget[currPersonaName][1]) {
							currPersona.body.y -= movementSpeed;
							animsDirection = "u";
							preAnimsDirection = "u";
							preAnimsDirectionDict[currPersonaName] = "u";
						} else {
							animsDirection = "";
						}

						currPronunciatio.x = currPersona.body.x - 15;
						currPronunciatio.y = currPersona.body.y - 15 - 25;

						let leftWalkName = currPersonaName + "-left-walk";
						let rightWalkName = currPersonaName + "-right-walk";
						let downWalkName = currPersonaName + "-down-walk";
						let upWalkName = currPersonaName + "-up-walk";

						if (animsDirection == "l") {
							currPersona.anims.play(leftWalkName, true);
						} else if (animsDirection == "r") {
							currPersona.anims.play(rightWalkName, true);
						} else if (animsDirection == "u") {
							currPersona.anims.play(upWalkName, true);
						} else if (animsDirection == "d") {
							currPersona.anims.play(downWalkName, true);
						}
					}
				}
			} else {
				if (preAnimsDirectionDict[currPersonaName] == "l") currPersona.setTexture(currPersonaName, "left");
				else if (preAnimsDirectionDict[currPersonaName] == "r") currPersona.setTexture(currPersonaName, "right");
				else if (preAnimsDirectionDict[currPersonaName] == "u") currPersona.setTexture(currPersonaName, "up");
				else if (preAnimsDirectionDict[currPersonaName] == "d") currPersona.setTexture(currPersonaName, "down");
				currPersona.anims.stop();

				finished = true;
				buttonPlay.text = "[回放结束]";
				buttonPause.setVisible(false);
			}
		}

		if (executeCount == 0) {
			for (let i = 0; i < Object.keys(personas).length; i++) {
				let currPersonaName = Object.keys(personas)[i];
				let currPersona = personas[currPersonaName];
				currPersona.body.x = movementTarget[currPersonaName][0];
				currPersona.body.y = movementTarget[currPersonaName][1];
			}
			executeCount = executeCountMax + 1;
			step = step + 1;

			startDatetime = new Date(startDatetime.getTime() + stepSize);
			currentTime.setText(startDatetime.toLocaleTimeString("zh-CN", datetimeOptions));
			
			// Update agent logs if viewing
			if (showAgentLogs && selectedAgent !== null) {
				updateAgentLogs(selectedAgent, agentLogsData, startDatetime, textAgentLogs);
			}
			
			// Notify time update
			if (onTimeUpdate) {
				onTimeUpdate(startDatetime);
			}
			
			// Notify agent log update
			if (onAgentLogUpdate) {
				onAgentLogUpdate(startDatetime);
			}
		}

		executeCount -= 1;
	}

	return {
		preload,
		create,
		update
	};
}

