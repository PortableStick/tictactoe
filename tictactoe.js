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
				} else {
					return "ERR";
				}
			},
			getCoords : function(){
				return {x: this.x, y: this.y};
			},
			hasData	: function(){
				 return this.currentTile !== this.BLANK_tile && this.currentTile !== null;
			}

		}//end returned tile object
	}
	return {
		anim 			: 0,
		isAnimating 	: false,
		canvas			: document.createElement("canvas"),
		context			: null,
		tiles			: [],
		currentPlayer 	: "X_tile",
		init : function(){
				var currentContext 	= this,
					resetButton 	= document.createElement("div");
					this.context	= this.canvas.getContext("2d"),
					this.tiles		= (function(){
							var tmpArray = [];
							for(var i = 0; i < 9; i++){
								var x = i % 3 * 140 + 20,
									y = Math.floor(i/3) * 140 + 20;
									tmpArray.push(_tile(x,y))
							}
							return tmpArray;
						})(),
					this.reset();
					resetButton.addEventListener('mousedown', currentContext.reset.bind(this));
					resetButton.id = "resetButton";
					resetButton.innerHTML = "Reset";

				this.canvas.width = this.canvas.height = 440;
				this.canvas.addEventListener('mousedown', function(){
								var targetElement 	= event.target,
									px				= event.clientX - targetElement.offsetLeft,
									py				= event.clientY - targetElement.offsetTop;

									if(px % 140 >= 20 && py % 140 >= 20){
										var idx = Math.floor(px/140) + (Math.floor(py/140) * 3);

										currentContext.tiles[idx].setCurrentTile(currentContext.currentPlayer);
										currentContext.evaluateBoard();
										currentContext.currentPlayer = currentContext.currentPlayer === "X_tile" ? "O_tile" : "X_tile";
									}
							});
			document.body.appendChild(this.canvas);
			document.body.appendChild(resetButton);
			this.tick();
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
				coords		= tile.getCoords(),
				x			= coords.x,
				y			= coords.y;
				
			this.context.drawImage(currentTile,x,y);
		},
		tick : function(){
			this.render();
			window.requestAnimationFrame(this.tick.bind(this));
		},
		animate : function(){
			this.isAnimating = true;
			//animate
			this.anim = 1;
			this.isAnimating = false;
		},
		render : function(){
			//clear the canvas
			this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
			//redraw the canvas
			for(var i = this.tiles.length;i--;){
				this.draw(this.tiles[i]);
			}
		},
		checkIfBoardIsFull: function(){
			return this.tiles.map(function(x){
				return x.hasData() ? 1 : 0;
			}).join('');
		},
		evaluateBoard: function(){
			var context 		= this,
				winningStates	= [	"111000000", "000111000", "000000111",
									"100100100", "001001001", "010010010",
									"001010100", "100010001" ],
				currentState 	= this.tiles.map(function(x){
					 if(x.getCurrentTile() === context.currentPlayer){
					 	return 1;
					 } else {
					 	return 0;
					 }
				});
				winningStates = winningStates.map(function(x){
					return parseInt(x, 2);
				});
				currentState = currentState.join('');
				currentState = parseInt(currentState, 2);
				for(var i = 0; i < winningStates.length; i++){
					var comparison = winningStates[i] & currentState;
					if(comparison === winningStates[i]){
						console.log("A winner is you, " + this.currentPlayer + "!");
					}
				}
				if(this.getLegalMoves().length === 0){
					console.log("We have a tie!");
				}
		},
		getLegalMoves: function(){
			var tmpArray = []
			this.tiles.map(function(x, idx){
				if(!x.hasData()){
					tmpArray.push(idx);				
				} 
			});
			return tmpArray;
		}
	}
}

function aiPlayer(gameboard){
	return {
		gameboard : gameboard

	}
}
