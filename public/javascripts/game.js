addEventListener("load",function(){
    waitPlayGame();
});

function waitPlayGame(){

    var mouseX;
    var mouseY;
    var connect=document.getElementById("connect");
    var disconnect=document.getElementById("disconnect");
    var play=document.getElementById("play");
    var letter;
    var playerTurno;
    var data={playerName:""};
    data.player=new player();
    var playersOn;
    var numbersOfLetters=null;
    var localId=null;
    var playerIndex=null;
    window.cancelInitGame=null;
    //inicializando

    var gameState=0;
    const INIT_GAME=0;
    const GUESS_LETTER=1;
    const NEW_GAME=2;
    const UPDATE_GAME=3;
    const GAME_OVER=4;

    connect.disable=false;
    disconnect.disable=true;
    play.disable=true;

    //Create the connect when clicked connect
    connect.addEventListener("click",function(){
        connect.disable=true;

        var socket=io();

        console.log(socket);
        disconnect.disabled=false;
        play.disabled=false;

        //canvas variables
        var canvas=document.getElementById("canvas-game");
        var context=canvas.getContext("2d");

        startCanvasGame(canvas,context,socket);
    });
    function startCanvasGame(canvas,context,socket){
        //game state
        console.log("Start canvas game ok");
        socket.emit("updateServer",null);
        socket.on('updateGame',function(config){
            data.playerName=data.player.name;
            console.log("update game");
            gameState=config.gameState;
            console.log("state game: "+gameState);
            playersOn=config.playersOn;
            numbersOfLetters=config.numberOfLetters;
            console.log(gameState+" GAME STATE");
            switchGame();
            function switchGame(){
                switch (gameState){
                    case(INIT_GAME):
                        initGame();
                        break;
                    case(GUESS_LETTER):
                        guessLetter();

                        break;
                    case(NEW_GAME):
                        newGame();
                        break;
                }
            }

            if(data.player){

                console.log("data turn "+data.player.turn);
                socket.emit("updateServer",data);

            }
        });

        function guessLetter(){
            //console.log(playersOn[playerIndex].letters);
            for(var i=0;i<playersOn[0].numberOfPlayersOnline;i++){
                if(playersOn[i].localId==localId){
                    playerIndex=i;

                    //update data.player
                    data.player.letters=playersOn[i].letters;
                    data.player.lettersWrongs=playersOn[i].lettersWrongs;
                    data.player.turn=playersOn[i].turn;
                }
                if(playersOn[i].turn==1) playerTurno=playersOn[i].name;
            }
            if(playersOn[playerIndex].turn==1){

                window.addEventListener('keypress',guessTheLetter);

            }

            renderGame();

        }

        function newGame(){

        }

        function renderGame(){
            var nameGame="Forca Online";
            var adivinha="Adivinhe a palavra, ela possui ";

            context.clearRect(0,0,canvas.width,canvas.height);
            context.fillStyle="#ffffff";
            context.rect(0,0,canvas.width,canvas.height);
            context.fill();

            //Moldura
            context.save();
            var gradient=context.createLinearGradient(0,0,170,0);
            gradient.addColorStop('0',"magenta");
            gradient.addColorStop('0.5',"blue");
            gradient.addColorStop('1',"red");
            context.strokeStyle=gradient;
            context.lineWidth=5;
            context.strokeRect(2,2,canvas.width-4,canvas.height-4);
            context.restore();

            //TÍTULO
            context.fillStyle="#FF9966";
            context.font="25px Arial";
            context.fillText(nameGame, (canvas.width/2)-context.measureText(nameGame).width/2, (canvas.height/13));


            //PLAYER 1 DRAWING
            context.fillStyle="lightblue";
            context.font="19px Arial";
            context.fillText("Player 1: "+playersOn[0].name,6,(canvas.height/16));
            //Lista de letras erradas
            context.fillStyle="green";
            context.font="15px Arial";
            context.fillText("Letras Erradas: "+playersOn[0].lettersWrongs,+13,(canvas.height/10));
            //Score do jogador
            context.fillStyle="red";
            context.font="15px Arial";
            context.fillText("Score: "+playersOn[0].score,+13,(canvas.height/7));

            //PLAYER 2 DRAWING
            context.fillStyle="lightblue";
            context.font="19px Arial";
            context.fillText("Player 2: "+playersOn[1].name,
                (canvas.width)-context.measureText("Player 2: "+playersOn[1].name).width-6,(canvas.height/16));
            //Lista de letras erradas
            context.fillStyle="green";
            context.font="15px Arial";
            context.fillText("Letras Erradas: "+playersOn[1].lettersWrongs,
                (canvas.width)-context.measureText("Letras Erradas: "+playersOn[1].lettersWrongs).width-10,(canvas.height/10));
            //Score do jogador
            context.fillStyle="red";
            context.font="15px Arial";
            context.fillText("Score: "+playersOn[1].score,(canvas.width)-context.measureText("Score: "+playersOn[1].score).width-10,(canvas.height/7));

            //Indica de quem é o turno para jogar
            context.fillStyle="red";
            context.font="17px Arial";
            context.fillText("Turno do "+playerTurno,
                (canvas.width/2)-context.measureText("Turno do "+playerTurno).width/2,(canvas.height/4));

            context.fillStyle="lightblue";
            context.font="19px Arial";
            context.fillText(adivinha+" "+numbersOfLetters+" letras.",
                (canvas.width/2)-context.measureText(adivinha+" "+numbersOfLetters+".").width/2, (canvas.height/3));

            //WORD
            context.fillStyle="black";
            context.font="23px Arial";
            context.fillText(playersOn[playerIndex].letters,
                (canvas.width/2)-context.measureText(playersOn[playerIndex].letters).width/2, (canvas.height*2/3));

            //AUTOR
            context.fillStyle="black";
            context.font="13px Arial";
            context.fillText("Marcio Perdigão", (canvas.width)-context.measureText("Marcio Perdigão").width, (canvas.height)-15);

        }

        function initGame(){
            window.addEventListener("keypress",eventKeyPressed);
            canvas.addEventListener("mousemove",onMouseMove);
            //Ca´pturar mouse click
            canvas.addEventListener("click",clickPlayEvent);

            var play="START THE GAME";
            var askName="Digite seu nome: ";
            context.fillStyle="#ffffff";

            context.fillSytle="white";
            context.rect(0,0,canvas.width,canvas.height);
            context.fill();

            context.fillStyle="black";
            context.font="20px Sans-Serif";
            context.fillText(askName,(canvas.width/2)-context.measureText(askName).width,+canvas.height/4);

            context.fillStyle="lightblue";
            context.font="18px Arial";
            context.fillText(data.playerName,(canvas.width/2),(canvas.height/4));

            //Capturar x y do mouse

            context.fillStyle="black";
            context.font="16px Sans-Serif";
            context.fillText(play,(canvas.width/2)-context.measureText(play).width,canvas.height/2);

        }

        function clickPlayEvent(e){
            if(mouseX>(canvas.width/2) && mouseY>100){
                window.removeEventListener("keypress",eventKeyPressed);
                canvas.removeEventListener("mousemove",onMouseMove);
                canvas.removeEventListener("click",clickPlayEvent);

                data.playerNameOk=true;

                data.player.name=data.playerName;
                localId=data.player.localId;

                socket.emit("newPlayer",data);
            }
        }
        function onMouseMove(e){
            mouseX= e.clientX-canvas.offsetLeft;
            mouseY= e.clientY-canvas.offsetTop;

        }

        function eventKeyPressed(e){

            data.player.name+=String.fromCharCode(e.keyCode);
            data.playerName;
            data.playerNameOk=true;

            socket.emit('updateServer',data.player.name)
        }

        //guess the letters
        function guessTheLetter(e){
            window.removeEventListener('keypress',guessTheLetter);
            letter=String.fromCharCode(e.keyCode);
            data.player.letter=letter;
            data.player.turn=0;
            console.log("FIM DO TURNO  >>>>>"+data.player.turn);

            socket.emit("guessEvent",{
                turn: data.player.turn,
                letter:data.player.letter,
                lettersWrongs:data.player.lettersWrongs,
                letters:data.player.letters
            });
        }
    }
}