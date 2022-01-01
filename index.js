function B(){
	this.Stores={};
	this.Inputs={};
	this.Types={};
	this.Engines={};
}
B.prototype.Console=function(Console){
	this.Test('CONSOLE',[Console]);
	this.Log=Console;
}
B.prototype.Language=function(Code,Language){
	this.Test('NAME',[Code]);
	this.Test('LANGUAGE',[Language]);
	this.Languages[Code]=Language;
}
B.prototype.Store=function(Name,API){
	this.Test('NAME',[Name]);
	this.Test('API',[API]);
	this.Stores[Name]=API;
}
B.prototype.Input=function(Name,Function){
	this.Test('NAME',[Name]);
	this.Test('FUNCTION',[Function]);
	this.Inputs[Name]=Function;
}
B.prototype.Meta=function(Identifier,Options,Required,Keys,Store){
	this.Test('NAME',[Identifier]);
	this.Identifier=Identifier;
	this.Test('OPTIONS',[Options,Required,Keys,true]);
	this.Test('STORE',[Store]);
	this.Meta={Store:this.Stores[Store],Options:this.Map(Options),Required:Required,Keys:Keys,Identifier:Identifier};
}
B.prototype.Type=function(Name,Options,Required,Keys,Store){
	this.Test('NAME',[Name]);
	this.Test('OPTIONS',[Options,Required,Keys]);
	this.Test('STORE',[Store]);
	this.Types[Name]={Store:this.Stores[Store],Options:this.Map(Options),Required:Required,Keys:Keys};
}
B.prototype.Engine=function(Name,Function){
	this.Test('NAME',[Name]);
	this.Test('FUNCTION',[Function]);
	this.Engines[Name]=Function;
}
B.prototype.Search=function(Filters,Lang){
	return await this.Meta.Store.Search(Filters,this).then(R=>{return R?R:this.Lang(Lang,'STOREFAILURE')});
}
B.prototype.Create=function(Meta,Data,Lang){
	let M=await this.Scrub(Meta);
	if(!M)return this.Lang(Lang,'BADTYPE');
	if(!Array.isArray(Data))return this.Lang(Lang,'BADDATA');
	let D=[];
	for(let i=0,l=Data.length;i<l;i++){
		let d=await this.Scrub(Data[i],Meta);
		if(!d)return this.Lang(Lang,'BADDATA');
		d.push(d);
	}
	let Recipt=[];
	let Keys=await this.Meta.Store.Create(Meta,this);
	Recipt.push(Keys);
	for(let i=0,l=D.length;i<l;i++){
		this.Key(Keys,D[i]);
		let keys=await this.Types[D[i][this.Identifier]].Store.Create(D[i],this);
		Recipt.push(keys);
	}
	return Recipt;
}
B.prototype.Read=function(Keys,Engine,Lang){
	if(typeof Keys!='object'||Keys===null||Object.keys(Keys).every(K=>this.Meta.Keys.includes(K))||this.Meta.Keys.every(K=>K in Keys))return this.Lang(Lang,'BADKEYS');
	if(!(Engine in this.Engines))return this.Lang(Lang,'BADENGINE');
	let Meta=await this.Meta.Store.Read(Keys,this);
	if(!Meta)return this.Lang(Lang,'MISSING');
	let Data=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Types[o[i]].Store))continue;
		else Queried.push(this.Types[o[i]].Store);
		let D=await this.Types[o[i]].Store.Search(Keys,this);
		if(D)Data.push(...D);
	}
	return await this.Engines[Engine](Meta,Data,this);
}
B.prototype.Update=function(Keys,Element,Operation,Lang){
	if(typeof Keys!='object'||Keys===null||Object.keys(Keys).every(K=>this.Meta.Keys.includes(K))||this.Meta.Keys.every(K=>K in Keys))return this.Lang(Lang,'BADKEYS');
	if(typeof Operation!='boolean'&&(typeof Operation!='object'||Operation===null))return this.Lang(Lang,'BADUPDATE');
	let Meta=await this.Meta.Store.Read(Keys,this);
	if(!Meta)return this.Lang(Lang,'MISSING');
	let Type=!Element[this.Identifier]?Type=this.Meta:this.Types[Element[this.Identifier]];
	if(!Type||typeof Operation=='boolean'&&Type==this.Meta)return this.Lang(Lang,'BADUPDATE');
	if(Operation===true){
		return await Type.Store.Create(Element,this).then(R=>{return R?R:this.Lang(Lang,'STOREFAILURE')});
	}else if(Operation===false){
		return await Type.Store.Delete(Element,this).then(R=>{return R?R:this.Lang(Lang,'STOREFAILURE')});
	}else{
		let o=Object.keys(Operation);
		for(let i=0,l=o.length;i<l;i++)if(!(o[i] in Type.Options))return this.Lang(Lang,'BADUPDATE');
		for(let i=0,l=o.length;i<l;i++)Operation[o[i]]=Type.Options(Operation[o[i]],Meta,this);
		for(let i=0,l=o.length;i<l;i++)if(Operation[o[i]]===false)return this.Lang(Lang,'BADUPDATE');
		return await Type.Store.Update(Element,Operation,this).then(R=>{return R?R:this.Lang(Lang,'STOREFAILURE')});
	}
}
B.prototype.Delete=function(Keys,Lang){
	if(typeof Keys!='object'||Keys===null||Object.keys(Keys).every(K=>this.Meta.Keys.includes(K))||this.Meta.Keys.every(K=>K in Keys))return this.Lang(Lang,'BADKEYS');
	let Meta=await this.Meta.Store.Read(Keys,this);
	if(!Meta)return this.Lang(Lang,'MISSING');
	let Recipt=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Types[o[i]].Store))continue;
		else Queried.push(this.Types[o[i]].Store);
		let D=await this.Types[o[i]].Store.Delete(Keys,this);
		if(D)Data.push(...D);
	}
	await this.Meta.Store.Delete(Keys,this).then(R=>Recipt.push(R));
	return Recipt;
}
B.prototype.Scrub=function(Options,Meta){
	let Type;
	if(!Options[this.Identifier])Type=this.Meta;
	else if(this.Identifier in this.Types)Type=this.Types[Options[this.Identifier]];
	else return false;
	for(let i=0,l=Type.Keys.length;i<l;i++)if(!Type.Keys[i] in Options)return false;
	for(let i=0,l=Type.Required.length;i<l;i++)if(!Type.Required[i] in Options)return false;
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++){
		Shell[o[i]]=await Type.Options[O[i]](Options[O[i]],Meta,this);
		if(!Shell[o[i]])return false;
	}
	return Shell;
}
B.prototype.Key=function(Meta,Type){for(let i=0,l=this.Meta.Keys.length;i<l;i++)Type[this.Meta.Keys[i]]=Meta[this.Meta.Keys[i]];}
B.prototype.Map=function(Options){
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	return Shell;
}
B.prototype.Test=function(Test,Inputs){
	if(!this.Testers[Test].apply(this,Inputs))throw new Error(this.Log[Test]);
}
B.prototypes.Testers={
	CONSOLE:function(Value){
		if(typeof Value!='object'||Value===null)return false;
		let Required=Object.keys(this.Log);
		for(let i=0,l=Required.length;i<l;i++)if(!(Required[i] in Value)||typeof Value[Required[i]]!='string')return false;
		return true;
	},
	LANGUAGE:function(Value){
		if(typeof Value!='object'||Value===null)return false;
		let Required=Object.keys(this.Languages.Default);
		for(let i=0,l=Required.length;i<l;i++)if(!(Required[i] in Value)||typeof Value[Required[i]]!='string')return false;
		return true;
	}
	NAME:function(Value){return typeof Value=='string'},
	API:function(Value){return(typeof Value=='object'&&typeof Value.Create=='function'&&typeof Value.Read=='function'&&typeof Value.Update=='function'&&typeof Value.Delete=='function')},
	FUNCTION:function(Value){return typeof Value=='function'},
	OPTIONS:function(Options,Required,Keys,Meta){
		if(typeof Options!='object'||Options==null||!Array.isArray(Required)||!Array.isArray(Keys))return false;
		if(!Meta)for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(this.Meta.Keys.includes(Options[o[i]]))return false;
		for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(!(Options[o[i]] in this.Inputs))return false;
		for(let i=0,l=Required.length;i<l;i++)if(!(Required[i] in Options))return false;
		for(let i=0,l=Keys.length;i<l;i++)if(!(Keys[i] in Options))return false;
		return true;
	},
	STORE:function(Value){return Value in this.Stores},
}
B.prototype.Log={
	CONSOLE:'The Console parameter did not contain the necessary messages',
	LANGUAGE:,
	NAME:'The Name parameter was not a string',
	API:'The API parameter was not valid',
	FUNCTION:'The Function parameter was not a function',
	OPTIONS:'Validation of the Options, Required, and Keys parameters failed',
	STORE:'The Store parameter did not match a registered Store',
}
B.prototype.Lang=function(Lang,Message){return Lang in this.Languages?this.Languages[Lang][Message]:this.Languages.Default[Message]}
B.prototype.Languages={
	Default:{
		BADTYPE:'The input provided contained an invalid type',
		BADDATA:'The Data provided was not an array',
		BADKEYS:'The Keys provided were not valid',
		BADENGINE:'The requested format was not valid',
		MISSING:'The resource you requested was not found',
		BADUPDATE:'The inputs provided were not sufficient to perform an update',
		STOREFAILURE:'There was a data storage failure that interrupted the operation attempted',
	}
}
//B.Documentation=function(File){}
module.exports=B