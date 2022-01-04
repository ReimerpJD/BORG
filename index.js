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
B.prototype.Search=async function(Filters,Auth){
	return await this.Meta.Store.Search(Filters,this).catch(()=>{throw 'STOREFAILURE'});
}
B.prototype.Create=async function(Meta,Data,Auth){
	if(Auth&&typeof Auth!='function')throw 'BADAUTH';
	if(Meta[this.Identifier])throw 'BADTYPE';
	await this.Scrub(Meta).catch(()=>{throw 'BADTYPE'});
	if(Auth&&!Auth(Meta))throw 'NOTAUTHORIZED';
	let Keys=await this.Meta.Store.Create(Meta,this).catch(()=>{throw 'STOREFAILURE'});
	if(!Keys)throw 'STOREFAILURE';
	let Recipt=[];
	Recipt.push(Keys);
	if(Array.isArray(Data)){
		for(let i=0,l=Data.length;i<l;i++){
			await this.Scrub(Data[i],Meta,Keys).catch(()=>{return 'BADTYPE'});
			if(Data[i]=='BADTYPE'){
				Recipt.push(Data[i]);
				continue;
			}
			this.Key(Keys,Data[i]);
			let R=await this.Types[Data[i][this.Identifier]].Store.Create(Data[i],this).catch((E)=>{return E});
			Recipt.push(R);
		}
	}
	return Recipt;
}
B.prototype.Read=async function(Keys,Engine,Auth){
	if(Auth&&typeof Auth!='function')throw 'BADAUTH';
	if(!(Engine in this.Engines))throw 'BADENGINE';
	let Meta=await this.Meta.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	if(Auth&&!Auth(Meta))throw 'NOTAUTHORIZED';
	let Data=[];
	let Queried=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(Queried.includes(this.Types[o[i]].Store))continue;
		else Queried.push(this.Types[o[i]].Store);
		let D=await this.Types[o[i]].Store.Search(Keys,this).catch(()=>{throw 'STOREFAILURE'});
		if(D)Data.push(...D);
	}
	return await this.Engines[Engine](this,Meta,Data);
}
B.prototype.Update=async function(Element,Operation,Auth){
	if(Auth&&typeof Auth!='function')throw 'BADAUTH';
	if(typeof Operation!='boolean'&&(typeof Operation!='object'||Operation===null||this.Identifier in Operation||this.Meta.Keys.some(E=>E in Operation)))throw 'BADUPDATE';
	let Keys={};
	this.Key(Element,Keys);
	let Meta=await this.Meta.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	if(Auth&&!Auth(Meta))throw 'NOTAUTHORIZED';
	let Type=Element[this.Identifier]?this.Types[Element[this.Identifier]]:this.Meta;
	if(!Type||(typeof Operation=='boolean'&&Type==this.Meta))throw 'BADUPDATE';
		if(Operation===true){
		return await Type.Store.Create(Element,this).catch(()=>{throw 'STOREFAILURE'});
	}else if(Operation===false){
		return await Type.Store.Delete(Element,this).catch(()=>{throw 'STOREFAILURE'});
	}else{
		let o=Object.keys(Operation);
		for(let i=0,l=o.length;i<l;i++)if(!(o[i] in Type.Options)||Type.Keys.includes(o[i]))throw 'BADUPDATE';
		let Shell={};
		for(let i=0,l=o.length;i<l;i++)Shell[o[i]]=await Type.Options[o[i]](Operation[o[i]],Shell,Meta,this);
		for(let i=0,l=o.length;i<l;i++)if(Shell[o[i]]===false)throw 'BADUPDATE';
		return await Type.Store.Update(Element,Shell,this).catch(()=>{throw 'STOREFAILURE'});
	}
}
B.prototype.Delete=async function(Keys,Auth){
	if(Auth&&typeof Auth!='function')throw 'BADAUTH';
	let Meta=await this.Meta.Store.Read(Keys,this).catch(()=>{throw 'STOREFAILURE'});
	if(!Meta)throw 'MISSING';
	if(Auth&&!Auth(Meta))throw 'NOTAUTHORIZED';
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
B.prototype.Scrub=async function(Options,Meta,Keys){
	let Type;
	if(!(this.Identifier in Options))Type=this.Meta;
	else if(Options[this.Identifier] in this.Types)Type=this.Types[Options[this.Identifier]];
	else throw false;
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++){
		Options[o[i]]=await Type.Options[o[i]](Options[o[i]],Shell,Meta,this);
		if(!Options[o[i]])throw false;
		Shell[o[i]]=Options[o[i]];
	}
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