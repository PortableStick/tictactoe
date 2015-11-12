//Modal window stuff
					beginButton		= document.getElementById('begin'),
					newGameBtn		= document.getElementById('newGame');

					newGameBtn.addEventListener('mousedown', currentContext.reset.bind(this));
					beginButton.addEventListener('mousedown', function(){
							var modal 				= document.getElementById('modal'),
								gameModeSetting		= document.getElementsByName('game_mode'),
								difficulty			= document.getElementsByName('difficulty'),
								playerChoice		= document.getElementsByName('player'),
								inputFields			= document.getElementById('input');
								modal.style.opacity	= 0;
								setTimeout(function(){
									modal.style.display 		= 'none';
									inputFields.style.display 	= 'none';
								}, 400)
								for(var i = 0; i < gameModeSetting.length; i++){
									if(gameModeSetting[i].checked){
										currentContext.gameMode = gameModeSetting[i].value;
									}
								}
								for(var i = 0; i < difficulty.length; i++){
									if(difficulty[i].checked){
										currentContext.depth = difficulty[i].value;
									}
								}
								for(var i = 0; i < playerChoice.length; i++){
									if(playerChoice[i].checked){
										currentContext.playerTile = playerChoice[i].value;
									}
								}

								if(currentContext.gameMode === '1P'){
									currentContext.aiPlayer	= aiPlayer(currentContext);
									currentContext.aiTile	= currentContext.playerTile === "X_tile" ? "O_tile" : "X_tile";
								}
						});

//reset button
resetButton.addEventListener('mousedown', currentContext.reset.bind(this));
					resetButton.id 			= "resetButton";
					resetButton.className	= "btn";
					resetButton.innerHTML 	= "Reset";
//Event listener
				
this.canvas.addEventListener('mousedown', function(){
	var targetElement 	= event.target,
		px				= event.clientX - targetElement.offsetLeft,
		py				= event.clientY - targetElement.offsetTop;

		if(px % 140 >= 20 && py % 140 >= 20){
			var idx = Math.floor(px/140) + (Math.floor(py/140) * 3);
			currentContext.tiles[idx].setCurrentTile(currentContext.currentPlayer);
			var result = currentContext.evaluateBoard(currentContext.tiles, currentContext.currentPlayer);

			if(result){

			}

			if(currentContext.gameMode === "1P"){

			} else if(currentContext.gameMode === "2P"){
				currentContext.currentPlayer = currentContext.currentPlayer === "X_tile" ? "O_tile" : "X_tile";
			}
		}
});