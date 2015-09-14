#!/usr/bin/env node

/**
 * Module dependencies.
 */

var forcas=require('./forca');
var forca=new forcas();
var cc= require('config-multipaas');
var config= cc();
var app = require('./app');
var debug = require('debug')('yousilly:server');
var http=require('http').Server(app);

var server = require('http').createServer(app);
var io = require('socket.io')(http).listen(server);

var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

var playersDone=0;

var playerId=0;
var playersOn=[];
var usersOnline=0;
var gameState=0;
var data=null;
var firstToPlay=0;
var forcaWord={};
var numberOfLetters=0;
var okChange=0,tokenId;// who have the token have the turn
var indexOfTheWord;
var indexOfLastLetters;
var WordFinished=0;
io.on('connection',function(socket){
    usersOnline++;
    socket.playerId=playerId;

    playersOn[playerId]=socket;

    playerId++;

    socket.on('updateServer',function(config){

    });
    socket.on('guessEvent',function(data){
        playersOn[socket.playerId].player.turn=data.turn;
        playersOn[socket.playerId].player.letter=data.letter;
        playersOn[socket.playerId].player.lettersWrongs=data.lettersWrongs;
        playersOn[socket.playerId].player.letters=data.letters;

        var index=0;

        var flag=true; //if flag more then 1 then dont put the letter into the lettersWrongs

        //verifica se a letra já foi jogada
        indexOfLastLetters=(playersOn[socket.playerId].player.letters.toUpperCase()).indexOf(playersOn[socket.playerId].player.letter.toUpperCase());
        console.log(playersOn[socket.playerId].player.letters+" indexOfLastLetters "+indexOfLastLetters);
        if(indexOfLastLetters!=-1) index=-1;

        while(index!=-1) {

            //se ainda nao foi jogada procura pelo indice dela quantas vezes ela existir na mesma palavra até retornar -1 e sair do loop
            index = forca.palavras[indexOfTheWord].indexOf(playersOn[socket.playerId].player.letter.toUpperCase(), index);
            if (index != -1) {
                //Aumenta o score do jogador
                playersOn[socket.playerId].player.score+=10;



                console.log("ACERTOUUUUU UMA LETRA");

                for (var indefOfPlayer = 0; indefOfPlayer < usersOnline; indefOfPlayer++) {
                    playersOn[indefOfPlayer].player.letters = setCharAt(playersOn[indefOfPlayer].player.letters,
                        index, playersOn[socket.playerId].player.letter);
                }

                function setCharAt(str, index, chr) {
                    if (index > str.length - 1) return str;
                    return str.substr(0, index) + chr + str.substr(index + 1);
                }
                //Verifica se a palavra ja está completa para inicializar um novo game
                WordFinished++;
                if(WordFinished==playersOn[socket.playerId].player.letters.length){
                    console.log("NEW GAME NOW");
                    renewTheGame(playersOn);
                    WordFinished=0;
                    //return 0;
                }
                index++;
                flag=false;

            }
            else if(index==-1 && flag) {
                playersOn[socket.playerId].player.lettersWrongs += playersOn[socket.playerId].player.letter;
                //Diminui o score do jogador
                playersOn[socket.playerId].player.score-=5;
            }
        }

        //Renew the game to player with another word


    });
    socket.on('newPlayer',function(config){
        data=config;
        console.log("NEW PLAYER OUTSIDE");
        if(data!=null){
            console.log("newPlayer");

            if(data.playerNameOk==true){

                playersOn[socket.playerId].playerOk=data.playerNameOk;
                playersOn[socket.playerId].player=data.player;
                playersOn[socket.playerId].player.numberOfPlayersOnline=usersOnline;
                playersOn[socket.playerId].player.id=socket.playerId;
                socket.playerOk=data.playerNameOk;
                socket.player=data.player;

            }
        }
    });

    setInterval(updateServer,500);

    function updateServer() {

        //console.log('updateGame');

        if (verificarPlayersDone(playersOn)) {

            gameState = 1;
            var playerList = [];

            //Who gonna play first?
            if (firstToPlay == 0) {
                renewTheGame(playersOn);
            }
            //salva os players em objetos unicos no array, tirando o scoket dentro deles pois é muito pesado para transportar
            for (var i = 0; i < playersOn[socket.playerId].player.numberOfPlayersOnline; i++) {
                playerList.push(playersOn[i].player);
            }

            //verify if the player guessed and lose the turn and still have the token
            if (playersOn[socket.playerId].player.turn == 0 && tokenId == socket.playerId) {
                console.log("TURN OFFFFFFF>>>>> " + playersOn[socket.playerId].player.name);
                playersOn[socket.playerId].player.turn = 0;
                okChange = 1;
            }
            else if (playersOn[socket.playerId].player.turn == 0 && tokenId != socket.playerId && okChange == 1) {
                playersOn[socket.playerId].player.turn = 1;
                tokenId = socket.playerId;
                okChange = 0;
            }
        }

        else if (io.sockets.sockets.length < 1) {
            gameState = 0;
            firstToPlay=0;
            playersOn=null;
            okChange=0;
            tokenId=0;
        }
        console.log(io.sockets.sockets.length);
        console.log(playersOn);
        io.emit('updateGame', {
            playersOn: playerList,
            gameState: gameState,
            numberOfLetters: forcaWord.numbersOfLetters
        });
    }
        //util functions

        /*Renova a sessão do game
        * não sei se pode da conflito com os eventos, causando um grande desastre no game*/
        function renewTheGame(){
            console.log("FUNCIONA");
            firstToPlay = Math.floor(Math.random() * 2);
            playersOn[firstToPlay].player.turn=1;

            tokenId=playersOn[firstToPlay].player.id;

            //The word
            indexOfTheWord=Math.floor(Math.random()*12);
            forca.palavras.sort();
            forcaWord.theWord = forca.palavras[indexOfTheWord];
            forcaWord.numbersOfLetters = forca.palavras[indexOfTheWord].length;
            numberOfLetters=forca.palavras[indexOfTheWord].length;

            //Cria uma variavel com o tamanho certo mas so underline
            for(var indefOfPlayer=0;indefOfPlayer<usersOnline;indefOfPlayer++) {
                //Apaga as letras erradas ou pelo menos tenta, não sei
                playersOn[indefOfPlayer].player.lettersWrongs="";
                //Copia a palavra para a instância de usuario
                playersOn[indefOfPlayer].player.letters=forca.palavras[indexOfTheWord];
                for (var indexOfLettr = 0; indexOfLettr <  playersOn[indefOfPlayer].player.letters.length; indexOfLettr++) {
                    playersOn[indefOfPlayer].player.letters = setCharAt(playersOn[indefOfPlayer].player.letters,
                        indexOfLettr, "_");
                }

                function setCharAt(str, index, chr) {
                    if (index > str.length - 1) return str;
                    return str.substr(0, index) + chr + str.substr(index + 1);
                }

            }
            console.log(playersOn[0].player.letters.toUpperCase());

            firstToPlay=1; //certeza de que first ToPlay não é zero

        }

        /*Verifica se os players estão prontos
        * Basicamente verifica se já colocaram seus nomes e se são 2*/
        function verificarPlayersDone() {

            for (var i = 0; i < usersOnline; i++) {
                if (!(usersOnline == 2 && playersOn[i].playerOk)) return false;

            }
            return true;
        }

});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(config.get('PORT'), config.get('IP'), function () {
    console.log( "Listening on " + config.get('IP') + ", port " + config.get('PORT') )
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
