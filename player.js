var character=function(){
    this.score=0;
    this.id=Math.random()*100;
    this.name="Unnamed";
    this.letters=[];
    this.lettersNumbers=[];
};

character.exports=character();