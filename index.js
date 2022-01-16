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
B.prototype.Search=async function(Filters,Store){
	if(!Store)return await this.Meta.Store.Search(Filters,this);
	else if(Store in this.Stores)return await this.Stores[Store].Search(Filters,this);
	else throw 'BADSTORE';
}
B.prototype.Create=async function(Element,Auth){
	let Type=this.Identify(Element);
	let Meta=await Type==this.Meta?Element:this.Meta.Store.Read(this.Key(Element),this).then(M=>{if(!M){throw 'MISSING'}else return M});
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw 'NOTAUTHORIZED'}});
	this.Scrub(Type,Element,Meta);
	return await Type.Store.Create(Element,this);
}
B.prototype.Read=async function(Keys,Auth){
	let Type=this.Identify(Keys);
	let Meta=await this.Meta.Store.Read(this.Key(Keys),this).then(M=>{if(!M){throw 'MISSING'}else return M});
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw 'NOTAUTHORIZED'}});
	return await Type==this.Meta?Meta:Type.Store.Read(Keys,this);
}
B.prototype.Update=async function(Keys,Updates,Auth){
	let Type=this.Identify(Keys);
	let Meta=await this.Meta.Store.Read(this.Key(Keys),this).then(M=>{if(!M){throw 'MISSING'}else return M});
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw 'NOTAUTHORIZED'}});
	this.Scrub(Type,Updates,Meta,true);
	return await Type.Store.Update(Keys,Updates,this);
}
B.prototype.Delete=async function(Keys,Auth){
	let Type=this.Identify(Keys);
	let Meta=await this.Meta.Store.Read(this.Key(Keys),this).then(M=>{if(!M){throw 'MISSING'}else return M});
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw 'NOTAUTHORIZED'}});
	return await Type.Store.Delete(Keys,this);
}
B.prototype.Open=async function(Keys,Auth){
	let Type=this.Identify(Keys);
	let Meta=await this.Meta.Store.Read(this.Key(Keys),this).then(M=>{if(!M){throw 'MISSING'}else return M});
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw 'NOTAUTHORIZED'}});
	return new this.Resource(this,Meta);
}
B.prototype.Run=async function(Engine){
	if(!(Engine in this.Engines))throw 'MISSINGENGINE';
	let Parameters=[];
	for(let i=1,l=arguments.length;i<l;i++)Parameters.push(arguments[i]);
	return await this.Engines[Engine](this,...Parameters);
}
B.prototype.Resource=function(Parent,Meta){
	this.Parent=Parent;
	this.Meta=Meta;
	this.Keys=Parent.Key(Meta);
}
B.prototype.Resource.prototype.Search=async function(Filters,Store){
	this.Parent.Key(this.Keys,Filters);
	return await this.Parent.Search(Filters,Store);
}
B.prototype.Resource.prototype.Create=async function(Element){
	this.Parent.Key(this.Keys,Element);
	return await this.Parent.Create(Element);
}
B.prototype.Resource.prototype.Read=async function(Keys){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.Read(Keys);
}
B.prototype.Resource.prototype.Update=async function(Keys,Updates){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.Update(Keys,Updates);
}
B.prototype.Resource.prototype.Delete=async function(Keys){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.Delete(Keys);
}
B.prototype.Identify=function(Element){
	if(typeof Element!='object'||Element===null)throw 'BADTYPE';
	let Type;
	if(!(this.Identifier in Element))Type=this.Meta;
	else if(Element[this.Identifier] in this.Types)Type=this.Types[Element[this.Identifier]];
	else throw 'BADTYPE';
	for(let i=0,l=this.Meta.Keys.length;i<l;i++)if(!this.Meta.Keys[i] in Element)throw 'BADTYPE';
	if(Type!=this.Meta)for(let i=0,l=Type.Keys.length;i<l;i++)if(!Type.Keys[i] in Element)throw 'BADTYPE';
	return Type;
}
B.prototype.Scrub=async function(Type,Options,Meta,Partial){
	let Shell={};
	if(!Partial){
		for(let i=0,l=this.Meta.Keys.length;i<l;i++)if(!this.Meta.Keys[i] in Element)throw 'BADTYPE';
		if(Type!=this.Meta)for(let i=0,l=Type.Keys.length;i<l;i++)if(!Type.Keys[i] in Options)throw 'BADTYPE';
		for(let i=0,l=Type.Required.length;i<l;i++)if(!Type.Required[i] in Options)throw 'BADTYPE';
	}
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++){
		if(o[i]==this.Identifier||this.Meta.Keys.includes(o[i]))continue;
		Options[o[i]]=await Type.Options[o[i]](Options[o[i]],Shell,Meta,this);
		if(!Options[o[i]])throw 'BADTYPE';
		Shell[o[i]]=Options[o[i]];
	}	
}
B.prototype.Key=function(Source,Target){
	if(typeof Target=='object'&&Target!==null)for(let i=0,l=this.Meta.Keys.length;i<l;i++){
		if(Source[this.Meta.Keys[i]]===undefined)throw 'BADTYPE';
		Target[this.Meta.Keys[i]]=Source[this.Meta.Keys[i]];
		return;
	}
	let Shell={};
	for(let i=0,l=this.Meta.Keys.length;i<l;i++){
		if(Source[this.Meta.Keys[i]]===undefined)throw 'BADTYPE';
		Shell[this.Meta.Keys[i]]=Source[this.Meta.Keys[i]];
	}
	return Shell;
}
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
		BADSTORE:'The Store parameter did not match a registered Store',
	}
}
//B.Documentation=function(File){}
module.exports=B