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
	this.Meta={Store:this.Stores[Store],Options:this.Map(Options),Required:Required,Keys:Keys};
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
B.prototype.Search=async function(Filters,Keys){
	let Type=(typeof Keys=='object'&&Keys!==null)?Keys[this.Identifier]?this.Types[Keys[this.Identifier]]:this.Meta:false;
	if(!Type)throw 'BADKEYS';
	return await Type.Store.Search(Filters,Keys,this).catch(()=>{throw 'STOREFAILURE'});
}
B.prototype.Create=async function(Element,Auth){
	let Type=this.Scrub(Element);
	if(!Element||!Type)throw 'BADTYPE';
	if(typeof Auth=='function'&&!Auth(Element))throw 'NOTAUTHORIZED';
	return await Type.Store.Create(Element,this).catch(()=>{throw 'STOREFAILURE'});
}
B.prototype.Read=async function(Keys,Updates,Auth){
	let Type=(typeof Keys=='object'&&Keys!==null)?Keys[this.Identifier]?this.Types[Keys[this.Identifier]]:this.Meta:false;
	if(!Type)throw 'BADKEYS';
	if(typeof Auth=='function'){
		let Keys=this.Key(Keys,{});
		let Meta=await this.Meta.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
		if(!Meta)throw 'MISSING';
		if(!Auth(Meta))throw 'NOTAUTHORIZED';
		if(Type==this.Meta)return Meta;
	}
	return await Type.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
}
B.prototype.Update=async function(Keys,Updates,Auth){
	let Type=(typeof Keys=='object'&&Keys!==null)?Keys[this.Identifier]?this.Types[Keys[this.Identifier]]:this.Meta:false;
	if(!Type)throw 'BADKEYS';
	if(typeof Auth=='function'){
		let Keys=this.Key(Keys,{});
		let Meta=await this.Meta.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
		if(!Meta)throw 'MISSING';
		if(!Auth(Meta))throw 'NOTAUTHORIZED';
	}
	let Shell={};
	let o=Object.keys(Updates);
	for(let i=0,l=o.length;i<l;i++){
		if(!(o[i] in Type.Options)||Type.Keys.includes(o[i]))throw 'BADUPDATE';
		Shell[o[i]]=await Type.Options[o[i]](Updates[o[i]],Shell,Meta,this);
		if(Shell[o[i]]===false)throw 'BADUPDATE';
	}
	return await Type.Store.Update(Keys,Shell,this).catch(()=>{throw 'STOREFAILURE'});
}
B.prototype.Delete=async function(Keys,Auth){
	let Type=(typeof Keys=='object'&&Keys!==null)?Keys[this.Identifier]?this.Types[Keys[this.Identifier]]:this.Meta:false;
	if(!Type)throw 'BADKEYS';
	if(typeof Auth=='function'){
		let Keys=this.Key(Keys,{});
		let Meta=await this.Meta.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
		if(!Meta)throw 'MISSING';
		if(!Auth(Meta))throw 'NOTAUTHORIZED';
	}
	return await Type.Store.Delete(Keys,this).catch(()=>{throw 'STOREFAILURE'});
}
//B.prototype.Rekey=function(Keys,Updates){}?
B.prototype.Open=async function(Keys,Auth){
	let Type=(typeof Keys!='object'||Keys!==null||Keys[this.Identifier])?false:this.Meta;
	if(!Type)throw 'BADKEYS';
	let Meta=await this.Meta.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
		if(!Meta)throw 'MISSING';
	if(typeof Auth=='function'&&!Auth(Meta))throw 'NOTAUTHORIZED';
	return new this.Resource(this,Meta);
}
B.prototype.Run=async function(Keys,Action,Parameters,Auth){
	if(!(Action in this.Engines))throw 'MISSINGPROCESS';
	let Resource=await this.Open(Keys,Auth);
	return await this.Engines[Action](Resource,...Parameters);
}
B.prototype.Resource=function(Parent,Meta){
	this.Parent=Parent;
	this.Meta=Meta;
	this.Keys=Parent.Key(Meta,{});
}
B.prototype.Resource.prototype.Search=function(Filters,Keys={}){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.Search(Filters,Keys);
}
B.prototype.Resource.prototype.Create=function(Element){
	this.Parent.Key(this.Keys,Element);
	return await this.Parent.Create(Element);
}
B.prototype.Resource.prototype.Read=function(Keys){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.Read(Keys);
}
B.prototype.Resource.prototype.Update=function(Keys,Updates){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.Update(Keys,Updates);
}
B.prototype.Resource.prototype.Delete=function(Keys){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.Delete(Keys);
}
//B.prototype.Resource.prototype.Rekey=function(Keys,Updates){}?
B.prototype.Scrub=async function(Options,Meta,Keys){
	let Type;
	if(!(this.Identifier in Options))Type=this.Meta;
	else if(Options[this.Identifier] in this.Types)Type=this.Types[Options[this.Identifier]];
	else throw 'BADTYPE';
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++){
		Options[o[i]]=await Type.Options[o[i]](Options[o[i]],Shell,Meta,this);
		if(!Options[o[i]])throw 'BADTYPE';
		Shell[o[i]]=Options[o[i]];
	}
	return Type;
}
B.prototype.Key=function(Keys,Type){for(let i=0,l=this.Meta.Keys.length;i<l;i++)Type[this.Meta.Keys[i]]=Keys[this.Meta.Keys[i]];}
B.prototype.Map=function(Options){
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	return Shell;
}
B.prototype.Test=function(Test,Inputs){
	if(!this.Testers[Test].apply(this,Inputs))throw new Error(this.Log[Test]);
}
B.prototype.Testers={
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
	},
	NAME:function(Value){return typeof Value=='string'},
	API:function(Value){return(typeof Value=='object'&&typeof Value.Search=='function'&&typeof Value.Create=='function'&&typeof Value.Read=='function'&&typeof Value.Update=='function'&&typeof Value.Delete=='function')},
	FUNCTION:function(Value){return typeof Value=='function'},
	OPTIONS:function(Options,Required,Keys,Meta){
		if(!Meta&&typeof this.Identifier!='string')return false;
		if(typeof Options!='object'||Options==null||!Array.isArray(Required)||!Array.isArray(Keys))return false;
		if(!Meta)for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(this.Meta.Keys.includes(o[i]))return false;
		for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(!(Options[o[i]] in this.Inputs))return false;
		for(let i=0,l=Required.length;i<l;i++)if(!(Required[i] in Options))return false;
		for(let i=0,l=Keys.length;i<l;i++)if(!(Keys[i] in Options))return false;
		return true;
	},
	STORE:function(Value){return Value in this.Stores},
}
B.prototype.Log={
	CONSOLE:'The Console parameter did not contain the necessary messages',
	LANGUAGE:'The Language parameter did not contain the necessary messages',
	NAME:'The Name parameter was not a string',
	API:'The API parameter was not valid',
	FUNCTION:'The Function parameter was not a function',
	OPTIONS:'Validation of the Options, Required, and Keys parameters failed',
	STORE:'The Store parameter did not match a registered Store',
}
B.prototype.Error=function(Message,Lang){return typeof Lang=='string'&&Lang in this.Languages?this.Languages[Lang][Message]:this.Languages.Default[Message]}
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