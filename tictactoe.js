function gameboard(){
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
				var currentContext 	= this;
				
					this.context	= this.canvas.getContext("2d");
					this.tiles		= (function(){
							var tmpArray = [];
							for(var i = 0; i < 9; i++){
								var x = i % 3 * 140 + 20,
									y = Math.floor(i/3) * 140 + 20;
									tmpArray.push(_tile(x,y));
									console.log(tmpArray[i]);
							}
							return tmpArray;
						})();

				this.reset();
					
				this.canvas.width = this.canvas.height = 440;

				
			this.tick();
		},
		setTile : function(tileIdx, newTile){
			this.tiles[tileIdx].setCurrentTile(newTile);
		},
		reset: function(){
			this.tiles.map(function(x){
				x.setCurrentTile("BLANK_tile");
				});
			this.currentPlayer = "X_tile";
		},
		draw : function(tile){
			//console.log(tile.getCurrentTile());
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
		},
		evaluateBoard: function(gameStateArray, currentPlayer){
			var winningStates	= [	"111000000", "000111000", "000000111",
									"100100100", "001001001", "010010010",
									"001010100", "100010001" ]
				.map(function(x){
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
			var tmpArray = []
			gameStateArray.map(function(x, idx){
				if(!x.hasData()){
					tmpArray.push(idx);				
				} 
			});
			return tmpArray;
		}
	}
}

function aiPlayer(boardObj){
	return {
		gameboard 	: boardObj,
		depth		: this.gameboard.depth,
		playerTile	: this.gameboard.playerTile,
		aiTile		: this.gameboard.aiTile,

		minimax		: function(depth, player){
						//console.log(this);
						var tmpTiles		= this.gameboard.tiles,
							legalMoves		= this.gameboard.getLegalMoves(tmpTiles),
							bestMove		= -1,
							best			= (player === this.playerTile ? -1000 : 1000);

							if(legalMoves.length === 0 || depth === 0){
								best = evaluate();
							} else {
								for(var i = legalMoves.length; i--;){
									var move = legalMoves[i];
									tmpTiles[move].setCurrentTile(player);
									if(player === this.aiTile){
										
										var current = this.mimimax(depth - 1, player);
											current = current[0];
										if(current > best){
											best = current;
											bestMove = move;
										}
									} else {
										var current = this.minimax(depth - 1, this.aiTile);
											current = current[0];
										if(current < best){
											best = current;
											bestMove = move;
										}
									}
								}
							}

							return [best, bestMove];
					},
		evaluate	: function(){
			const moves = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
			var score = 0;
			for(var i = moves.length; i--;){
				score += evaluateLine(moves[i]);
			}
			return score;
		},
		evaluateLine: function(arr){
			var score = 0;
			if(this.tmpTiles[arr[0]].equals(this.aiTile)){
				score = 1;
			} else if(this.tmpTiles[arr[0]].equals(this.playerTile)){
				score = -1;
			}

			if(this.tmpTiles[arr[1]].equals(this.aiTile)){
				if(score === 1){
					score = 10;
				} else if(score === -1){
					return 0;
				} else {
					score = 1;
				}

			} else if(this.tmpTiles[arr[1]].equals(this.playerTile)){
				if(score === -1){
					score = -10;
				} else if(score === 1){
					return 0;
				} else {
					score = -1;
				}
			}

			if(this.tmpTiles[arr[2]].equals(this.aiTile)){
				if(score > 0){
					score *= 10;
				} else if(score < 0){
					return 0;
				} else {
					score = 1;
				}
			} else if (this.tmpTiles[arr[2]].equals(this.playerTile)){
				if(score < 0){
					score *= 10;
				} else if(score > 0){
					return 0;
				} else {
					score = -1;
				}
			}

			return score;
		}

	}
}

function GameController(){
	return {
		gameMode		:	null,
		difficulty		:	0, //Will be a number used as depth for minimax
		currentPlayer	:	null,
		playerTile		:	null,
		aiTile			:	null,

	}
}
