function Gameboard(){
	function _tile(x, y){
		var canvas 			= document.createElement("canvas"),
			context 		= canvas.getContext("2d");

			context.strokeStyle = 'white';
			context.fillStyle	= 'tomato';
			context.lineCap		= 'round';
			context.lineWidth	= 8;
			context.width		= 120;
			context.height		= 120;
			
		return{
			BLANK_tile: (function(){
				context.fillRect(0,0,120,120);
				var blank = new Image();
				blank.src = canvas.toDataURL();
				return blank;
			})(),
			O_tile	: (function(){
				context.fillRect(0,0,120,120)
				context.beginPath();
				context.arc(60,60,40,0,2*Math.PI);
				context.stroke();
				var o = new Image();
				o.src = canvas.toDataURL();
				return o;
			})(),
			X_tile	: (function(){
				context.fillRect(0,0,120,120);
				context.beginPath();
				context.moveTo(20,20);
				context.lineTo(100,100);
				context.moveTo(100,20);
				context.lineTo(20,100);
				context.stroke();
				var x	= new Image();
				x.src	= canvas.toDataURL();
				return x;				
			})(),
			currentTile : null,
			x			: x,
			y			: y,
			setCurrentTile : function(tile){
				this.currentTile = this[tile];
			},
			getCurrentTile : function(){
				if(this.currentTile === this.BLANK_tile){
					return "BLANK_tile";
				} else if(this.currentTile === this.X_tile){
					return "X_tile";
				} else if(this.currentTile === this.O_tile){
					return "O_tile";
				} else{
					return "ERR";
				}
			},
			hasData	: function(){
				 return this.currentTile !== this.BLANK_tile && this.currentTile !== null;
			}
		}//end returned tile object
	}
	return {
		canvas			: document.createElement("canvas"),
		context			: null,
		tiles			: [],
		init : function(){
				this.canvas.width = this.canvas.height = 440;
				this.context	= this.canvas.getContext("2d");
				this.tiles		= (function(){
						var tmpArray = [];
						for(var i = 0; i < 9; i++){
							var x = i % 3 * 140 + 20,
								y = Math.floor(i/3) * 140 + 20;
								tmpArray.push(_tile(x,y));
						}
						return tmpArray;
					})();
				this.resetBoard();									
				document.body.appendChild(this.canvas);
				this.tick();
		},
		setTile: function(tileIdx, newTile){
			this.tiles[tileIdx].setCurrentTile(newTile);
		},
		resetBoard: function(){
			this.tiles.map(function(x){
				x.setCurrentTile("BLANK_tile");
			});
		},
		draw : function(tile){
			var currentTile = tile.currentTile,
				x			= tile.x,
				y			= tile.y;
				
			this.context.drawImage(currentTile,x,y);
		},
		tick : function(){
			this.render();
			window.requestAnimationFrame(this.tick.bind(this));
		},
		render : function(){
			//clear the canvas
			this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
			//redraw the canvas
			for(var i = this.tiles.length;i--;){
				this.draw(this.tiles[i]);
			}
		}
	}
}

function GameController(){
	return{
		gameboard: Gameboard(),
		gameMode: null,
		playerTile: null,
		aiTile: null,
		depth: 0,
		currentPlayer: "X_tile",
		init: function(){
			$('#startModal').show();
			$("#gameModeChoice").change(function(){
				if($("#gameModeChoice option:selected")[0].value === "2P"){
					$("#difficulty").hide();
				} else {
					$("#difficulty").show();
				}
			});
			$('#startButton').click(function(){
				$('#startModal').hide();
				var options = $('#gameOptions').serializeArray();
				controller.gameMode 	= options[0].value;
				controller.depth		= options[1].value;
				controller.playerTile 	= options[2].value;
				controller.aiTile		= controller.playerTile === "X_tile" ? "O_tile" : "X_tile";
			});
			this.gameboard.init();
			$('#resetButton').click(this.resetGame.bind(this));
			var board = this.gameboard,
				controller	= this;
				board.canvas.addEventListener('mousedown', function(){
									var targetElement 			= event.target,
										xPosition				= event.clientX - targetElement.offsetLeft,
										yPosition				= event.clientY - targetElement.offsetTop;
		
										if(xPosition % 140 >= 20 && yPosition % 140 >= 20){
											var idx = Math.floor(xPosition/140) + (Math.floor(yPosition/140) * 3);

											if(!board.tiles[idx].hasData()){
												board.setTile(idx, controller.currentPlayer);
												var result = controller.evaluateBoard(board.tiles, controller.currentPlayer);

												if(result){
													controller.endGame(result);
												} else {
													if(controller.gameMode === "1P"){
														var aiMove = controller.getBestMove(board.tiles, controller.depth);
														board.setTile(aiMove, controller.aiTile);
														var result = controller.evaluateBoard(board.tiles, controller.aiTile);

														if(result){
															controller.endGame(result);
														}

													} else if(controller.gameMode === "2P"){
														controller.currentPlayer = controller.currentPlayer === "X_tile" ? "O_tile" : "X_tile";
													}
												}
											}
										}
								});
		},
		resetGame: function(){
			this.gameboard.resetBoard();
			this.currentPlayer  = "X_tile";
			$("#startModal").show();
			$("#endModal").hide();
		},
		endGame: function(message){
			$('#endModal').show();
			$('#endMessage').html(message);
		},
		evaluateBoard: function(gameStateArray, currentPlayer){
			var winningStates	= [	"111000000", "000111000", "000000111",
									"100100100", "001001001", "010010010",
									"001010100", "100010001" ].map(function(x){
																	return parseInt(x, 2);
																}),
				currentState 	= gameStateArray.map(function(x){
					 if(x.getCurrentTile() === currentPlayer){
					 	return 1;
					 } else {
					 	return 0;
					 }
				}).join('');
				currentState = parseInt(currentState, 2);
				for(var i = 0; i < winningStates.length; i++){
					var comparison = winningStates[i] & currentState;
					if(comparison === winningStates[i]){
						if(currentPlayer === "X_tile"){
							currentPlayer = "X";
						} else {
							currentPlayer = "O";
						}
						return currentPlayer + " wins!";
					}
				}
				if(this.getLegalMoves(gameStateArray).length === 0){
					return "Tie game!";					
				}
		},
		getLegalMoves: function(gameStateArray){
			var tmpArray = [];
			gameStateArray.map(function(x, idx){
				if(!x.hasData()){
					tmpArray.push(idx);				
				} 
			});
			return tmpArray;
		},
		getBestMove: function(gameStateArray, depth){
			this.tmpArray = this.gameboard.tiles.slice();
			var bestIdx = this.minimax(depth, "aiPlayer");
			this.tmpArray = [];
			return bestIdx[1];
		},
		tmpArray: [],
		minimax: function(depth, player){
			var legalMoves	= this.getLegalMoves(this.gameboard.tiles),
				bestScore	= player === "aiPlayer" ? -10000 : 10000,
				bestMove	= -1,
				score		= 0;
			if(depth == 0 || legalMoves.length == 0){
				bestScore = this.evaluate(this.tmpArray);
			} else {
				if(player === "aiPlayer"){
				//maximize
				for(var i = legalMoves.length; i--;){
					var currentMove = legalMoves[i];
					this.tmpArray[currentMove].setCurrentTile(this.aiTile);
					score = this.minimax(depth - 1, "human")[0];
					if(score > bestScore){
						bestMove	= currentMove;
						bestScore 	= score + (depth - 10);
					}
					
					this.tmpArray[currentMove].setCurrentTile("BLANK_tile")
				}
				
				} else {
					//minimize
					for(var i = legalMoves.length; i--;){
						var currentMove = legalMoves[i];
						this.tmpArray[currentMove].setCurrentTile(this.playerTile)
						score = this.minimax(depth - 1, "aiPlayer")[0];
						if(score < bestScore){
							bestMove	= currentMove;
							bestScore 	= score + (depth + 10);
						}
						
						this.tmpArray[currentMove].setCurrentTile("BLANK_tile");
					}
				}		
			}
			return [bestScore, bestMove];
		},
		evaluate: function(){
			const moves = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
			var score = 0;
			for(var i = moves.length; i--;){
				score += this.evaluateLine(moves[i]);
			}
			return score;
		},
		evaluateLine: function(moves){
			var score = 0;
			if(this.tmpArray[moves[0]].getCurrentTile() === this.aiTile){
				score = 1;
			} else if(this.tmpArray[moves[0]].getCurrentTile() === this.playerTile){
				score = -1;
			}

			if(this.tmpArray[moves[1]].getCurrentTile() === this.aiTile){
				if(score === 1){
					score = 10;
				} else if(score === -1){
					return 0;
				} else {
					score = 1;
				}
			} else if(this.tmpArray[moves[1]].getCurrentTile() === this.playerTile){
				if(score === -1){
					score = -10;
				} else if(score === 1){
					return 0;
				} else {
					score = -1;
				}
			}

			if(this.tmpArray[moves[2]].getCurrentTile() === this.aiTile){
				if(score > 0){
					score *= 10;
				} else if(score < 0){
					return 0;
				} else {
					score = 1;
				}
			} else if(this.tmpArray[moves[2]].getCurrentTile() === this.playerTile){
				if(score < 0){
					score *= 10;
				} else if(score > 0){
					return 0;
				} else {
					score = 1;
				}
			} 
			return score;
		}
	}
}