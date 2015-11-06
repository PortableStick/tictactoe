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
				context.fillRect(0,0,100,100);
				context.beginPath();
				context.moveTo(20,20);
				context.lineTo(80,80);
				context.moveTo(80,20);
				context.lineTo(20,80);
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
				return this.currentTile;
			},
			getCoords : function(){
				return {x: this.x, y: this.y};
			}

		}//end returned tile object
	}
	return {
		anim 		: 0,
		isAnimating : false,
		canvas		: document.createElement("canvas"),
		context		: null,
		tiles		: [],
		init : function(){
				this.context	= this.canvas.getContext("2d"),
				this.tiles		= (function(){
							var tmpArray = [];
							for(var i = 0; i < 9; i++){
								var x = i % 3 * 140 + 20,
									y = Math.floor(i/3) * 140 + 20;
									tmpArray.push(_tile(x,y))
									tmpArray[i].setCurrentTile("O_tile");
							}
							return tmpArray;
						})();
				this.canvas.width = this.canvas.height = 440;
			document.body.appendChild(this.canvas);
			this.tick();
		},
		draw : function(tile){
			//console.log(tile.getCurrentTile());
			var currentTile = tile.getCurrentTile(),
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
	}
}

function aiPlayer(gameboard){
	return {
		gameboard : gameboard

	}
}
