
var player=function(config){
    this.score=0;
    this.id=0;
    this.localId=Math.floor(Math.random()*10000);
    this.name="";
    this.letters="                      ";
    this.letter=false;
    this.lettersWrongs=[];
    this.turn=0;
    this.numberOfPlayersOnline=null;
};