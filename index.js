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
B.prototype.Create=function(Meta){
	if(Meta[this.Identifier])throw 'BADTYPE';
	await this.Scrub(Meta).catch(()=>throw 'BADTYPE');
	let Keys=await this.Meta.Store.Create(this,Meta).catch(()=>{throw 'STOREFAILURE'});
	if(!Keys)throw 'STOREFAILURE';
	return new B.Resource(this,Keys);
}
B.prototype.Open=function(Keys){
	this.Scrub(Keys).catch(()=>throw 'BADKEYS');
	let Meta=await this.Meta.Store.Read(this,Keys).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	return new B.Resource(this,Keys);
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
	}
}
//B.Documentation=function(File){}
B.Resource=function(Keys,Framework){
	this.Framework=Framework;
	this.Keys=Keys;
}
B.Resource.Meta=function(){
	return await this.Framework.Meta.Store.Read(this.Framework,this.Keys).catch(()=>{throw 'STOREFAILURE'}).then(Meta=>{if(!Meta){throw 'MISSING'}else{return Meta}});
}
B.Resource.Render=function(Engine){
	if(!Engine in this.Framework.Engines)throw 'BADENGINE';
	let Meta=await this.Framework.Meta.Store.Read(this.Framework,this.Keys).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	let Data=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Framework.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Framework.Types[o[i]].Store))continue;
		else Queried.push(this.Framework.Types[o[i]].Store);
		let D=await this.Framework.Types[o[i]].Store.Search(this.Framework,this.Keys).catch(()=>{throw 'STOREFAILURE'});
		if(D)Data.push(...D);
	}
	return await this.Engines[Engine](this,Meta,Data);
}
B.Resource.Open=function(Filters){
	let Meta=await this.Framework.Meta.Store.Read(this.Framework,this.Keys).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	let Data=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Framework.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Framework.Types[o[i]].Store))continue;
		else Queried.push(this.Framework.Types[o[i]].Store);
		let D=await this.Framework.Types[o[i]].Store.Search(this.Framework,Filters).catch(()=>{throw 'STOREFAILURE'});
		if(D)Data.push(...D);
	}
}
B.Resource.Update=function(Element,Operation){
	if(typeof Element!='object'||Element===null||typeof Operation!='boolean'&&(typeof Operation!='object'||Operation===null||this.Framework.Identifier in Operation||this.Framework.Meta.Keys.some(E=>E in Operation)))throw 'BADUPDATE';
	let Meta=await this.Framework.Meta.Store.Read(this.Framework,this.Keys).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	let Type=!Element[this.Framework.Identifier]?Type=this.Framework.Meta:this.Framework.Types[Element[this.Identifier]];
	if(!Type||typeof Operation=='boolean'&&Type==this.Framework.Meta)throw 'BADUPDATE';
		if(Operation===true){
		return await Type.Store.Create(this.Framework,Element).catch(()=>{throw 'STOREFAILURE'});
	}else if(Operation===false){
		return await Type.Store.Delete(this.Framework,Element).catch(()=>{throw 'STOREFAILURE'});
	}else{
		let o=Object.keys(Operation);
		for(let i=0,l=o.length;i<l;i++)if(!(o[i] in Type.Options)||Type.Keys.includes(o[i]))throw 'BADUPDATE';
		for(let i=0,l=o.length;i<l;i++)Operation[o[i]]=Type.Options[o[i]].call(this.Framework,Operation[o[i]],Meta);
		for(let i=0,l=o.length;i<l;i++)if(Operation[o[i]]===false)throw 'BADUPDATE';
		return await Type.Store.Update(this.Framework,Element,Operation).catch(()=>{throw 'STOREFAILURE'});
	}
}
B.Resource.Delete=function(){
	let Meta=await this.Framework.Meta.Store.Read(this.Framework,this.Keys).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	let Recipt=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Framework.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Framework.Types[o[i]].Store))continue;
		else Queried.push(this.Framework.Types[o[i]].Store);
		let D=await this.Framework.Types[o[i]].Store.Delete(this.Framework,this.Keys);
		if(D)Data.push(...D);
	}
	await this.Framework.Meta.Store.Delete(this.Framework,this.Keys).then(R=>Recipt.push(R));
	return Recipt;
}
module.exports=B