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
B.prototype.Search=function(Filters){
	return await this.Meta.Store.Search(this,Filters).catch(()=>{throw 'STOREFAILURE'});
}
B.prototype.Create=function(Meta,Data){
	if(Meta[this.Identifier])throw 'BADTYPE';
	await this.Scrub(Meta).catch(()=>throw 'BADTYPE');
	let Keys=await this.Meta.Store.Create(this,Meta).catch(()=>{throw 'STOREFAILURE'});
	if(!Keys)throw 'STOREFAILURE';
	this.Key(Keys,Meta);
	return Keys;
}
B.prototype.Read=function(Keys,Auth){
	if(Auth&&typeof Auth!='function')throw 'BADAUTH';
	let Meta=await this.Meta.Store.Read(this,Meta).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	if(!Auth(Meta))throw 'NOTAUTHORIZED';
	let Data=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Types[o[i]].Store))continue;
		else Queried.push(this.Types[o[i]].Store);
		let D=await this.Types[o[i]].Store.Search(this,Keys).catch(()=>{throw 'STOREFAILURE'});
		if(D)Data.push(...D);
	}
	return await this.Engines[Engine](this,Meta,Data);
}
B.prototype.Update=function(Element,Operation,Auth){
	if(Auth&&typeof Auth!='function')throw 'BADAUTH';
	if(typeof Operation!='boolean'&&(typeof Operation!='object'||Operation===null||this.Identifier in Operation||this.Meta.Keys.some(E=>E in Operation)))throw 'BADUPDATE';
	let Keys=this.Key(Element,{});
	let Meta=await this.Meta.Store.Read(this,Keys).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	if(!Auth(Meta))throw 'NOTAUTHORIZED';
	let Type=!Element[this.Identifier]?Type=this.Meta:this.Types[Element[this.Identifier]];
	if(!Type||typeof Operation=='boolean'&&Type==this.Meta)throw 'BADUPDATE';
		if(Operation===true){
		return await Type.Store.Create(this,Element).catch(()=>{throw 'STOREFAILURE'});
	}else if(Operation===false){
		return await Type.Store.Delete(this,Element).catch(()=>{throw 'STOREFAILURE'});
	}else{
		let o=Object.keys(Operation);
		for(let i=0,l=o.length;i<l;i++)if(!(o[i] in Type.Options)||Type.Keys.includes(o[i]))throw 'BADUPDATE';
		let Shell={};
		for(let i=0,l=o.length;i<l;i++)Shell[o[i]]=Type.Options[o[i]].call(this,Operation[o[i]],Meta);
		for(let i=0,l=o.length;i<l;i++)if(Shell[o[i]]===false)throw 'BADUPDATE';
		return await Type.Store.Update(this,Element,Shell).catch(()=>{throw 'STOREFAILURE'});
	}
}
B.prototype.Delete=function(Keys,Auth){
	if(Auth&&typeof Auth!='function')throw 'BADAUTH';
	let Meta=await this.Meta.Store.Read(this,Keys).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	if(!Auth(Meta))throw 'NOTAUTHORIZED';
	let Recipt=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Types[o[i]].Store))continue;
		else Queried.push(this.Types[o[i]].Store);
		let D=await this.Types[o[i]].Store.Delete(this,Keys);
		if(D)Data.push(...D);
	}
	await this.Meta.Store.Delete(this,Keys).then(R=>Recipt.push(R));
	return Recipt;
}
B.prototype.Scrub=function(Options,Meta,Keys){
	let Type;
	if(!Options[this.Identifier])Type=this.Meta;
	else if(this.Identifier in this.Types)Type=this.Types[Options[this.Identifier]];
	else throw false;
	for(let i=0,l=Type.Keys.length;i<l;i++)if(!Type.Keys[i] in Options)throw false;
	if(!Keys)for(let i=0,l=Type.Required.length;i<l;i++)if(!Type.Required[i] in Options)throw false;
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++){
		Options[o[i]]=await Type.Options[o[i]].call(this,Options[o[i]],Shell);
		if(!Shell[o[i]])throw false;
		Shell[o[i]]=Options[o[i]];
	}
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
		if(!Meta&&typeof this.Identifier!='string')return false;
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
		NOTAUTHORIZED:'You are not authorized to perform the requested operation',
		BADAUTH:'A server authorization error occurred',
	}
}
//B.Documentation=function(File){}
module.exports=B