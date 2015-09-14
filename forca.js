var forca=function(){
    this.palavras=[];
    this.palavras[0]="PERMUTA";
    this.palavras[1]="PEDERASTA";
    this.palavras[2]="MARINHA";
    this.palavras[3]="DESOBEDIENCIA";
    this.palavras[4]="LETRAS";
    this.palavras[5]="FLAMENGO";
    this.palavras[6]="HOMOAFETIVO";
    this.palavras[7]="HOMOAFETIVIDADE";
    this.palavras[8]="PUTA";
    this.palavras[9]="HUMANOS";
    this.palavras[10]="REGALIAS";
    this.palavras[11]="BAILEU";
    this.palavras[12]="PERNAMBUCO";

};

forca.prototype.forcaAWord=function(){
    var numberWord=Math.random()*12;
    var word=this.palavras[numberWord];
    return(word);
};

module.exports=forca;
