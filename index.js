async function Search(Framework,Filters,Store,Auth){
	let SelectedStore=!Store?Framework.Meta.Store:Store in Framework.Stores?Framework.Stores[Store]:false;
	if(!Store)throw new Framework.OPERR('BAD_STORE');
	return await SelectedStore.Search(Filters).then(async A=>{
		if(Array.isArray(A)&&typeof Auth=='function'){
			let Results=[];
			for(let i=0,l=A.length;i<l;i++){
				let P=await Auth(A[i]);
				if(P)Results.push(A[i]);
			}
			A=Results;
		}
		return A;
	});
}
async function Create(Framework,Element,Auth){
	let Type=Framework.Identify(Element);
	let Meta=await Type==Framework.Meta?Element:Framework.Meta.Store.Read(Framework.Key(Element),Framework);
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw new Framework.OPERR('AUTHORIZATION_FAILED')}});
	await Framework.Scrub(Type,Element,Meta);
	return await Type.Store.Create(Element,Framework);
}
async function Read(Framework,Keys,Auth){
	let Type=Framework.Identify(Keys);
	let Meta=await Framework.Meta.Store.Read(Framework.Key(Keys),Framework);
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw new Framework.OPERR('AUTHORIZATION_FAILED')}});
	return await Type==Framework.Meta?Meta:Type.Store.Read(Keys,Framework);
}
async function Update(Framework,Keys,Updates,Auth){
	let Type=Framework.Identify(Keys);
	let Meta=await Framework.Meta.Store.Read(Framework.Key(Keys),Framework);
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw new Framework.OPERR('AUTHORIZATION_FAILED')}});
	await Framework.Scrub(Type,Updates,Meta,true);
	return await Type.Store.Update(Keys,Updates,Framework);
}
async function Delete(Framework,Keys,Auth){
	let Type=Framework.Identify(Keys);
	let Meta=await Framework.Meta.Store.Read(Framework.Key(Keys),Framework);
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw new Framework.OPERR('AUTHORIZATION_FAILED')}});
	return await Type.Store.Delete(Keys,Framework);
}
function B(){
	this.Stores={};
	this.Inputs={};
	this.Types={};
	this.Engines={
		Search:Search,
		Create:Create,
		Read:Read,
		Update:Update,
		Delete:Delete
	};
}
B.prototype.Console=function(Console){
	this.Test('CONSOLE',[Console]);
	this.Log=Console;
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
B.prototype.API=async function(Engine){
	if(!(Engine in this.Engines))return new this.Response(typeof Engine=='string'?Engine:'‽',Date.now()-Time,'BAD_API_CALL',false);
	let Time=Date.now();
	let Status='OK';
	let Parameters=[];
	for(let i=1,l=arguments.length;i<l;i++)Parameters.push(arguments[i]);
	let Response=await this.Engines[Engine](this,...Parameters).catch(E=>{
		Status=E instanceof this.OPERR&&E.message=='AUTHORIZATION_FAILED'?'AUTHORIZATION_FAILED':'ERROR';
		return false;
	});
	return new this.Response(Engine,Date.now()-Time,Status,Response);
}
B.prototype.Response=function(Query,Time,Status,Response){
	this.Query=Query;
	this.Time=Time;
	this.Status=Status;
	this.Response=Response;
	if(this.Status=='ERROR')this.Trace=new Error().stack;
}
B.prototype.OPERR=function(Code){
	let Shell={};
	Shell.name=Code;
	Shell.message=(Code in this.Log)?this.Log[Code]:'‽';
	Error.captureStackTrace(Shell,Error);
	return Shell;
}
B.prototype.Open=async function(Keys,Auth){
	let Meta=await this.Meta.Store.Read(this.Key(Keys),this);
	if(typeof Auth=='function')await Auth(Meta).then(A=>{if(!A){throw new this.OPERR('AUTHORIZATION_FAILED')}});
	return new this.Resource(this,Meta);
}
B.prototype.Resource=function(Parent,Meta){
	this.Parent=Parent;
	this.Meta=Meta;
	this.Keys=Parent.Key(Meta);
}
B.prototype.Resource.prototype.Search=async function(Filters,Store){
	this.Parent.Key(this.Keys,Filters);
	return await this.Parent.API('Search',Filters,Store);
}
B.prototype.Resource.prototype.Create=async function(Element){
	this.Parent.Key(this.Keys,Element);
	return await this.Parent.API('Create',Element);
}
B.prototype.Resource.prototype.Read=async function(Keys){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.API('Read',Keys);
}
B.prototype.Resource.prototype.Update=async function(Keys,Updates){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.API('Update',Keys,Updates);
}
B.prototype.Resource.prototype.Delete=async function(Keys){
	this.Parent.Key(this.Keys,Keys);
	return await this.Parent.API('Delete',Keys);
}
B.prototype.Identify=function(Element){
	if(typeof Element!='object'||Element===null)throw new this.OPERR('BAD_TYPE');
	let Type;
	if(!(this.Identifier in Element))Type=this.Meta;
	else if(Element[this.Identifier] in this.Types)Type=this.Types[Element[this.Identifier]];
	else throw new this.OPERR('BAD_TYPE');
	for(let i=0,l=this.Meta.Keys.length;i<l;i++)if(!this.Meta.Keys[i] in Element)throw new this.OPERR('BAD_TYPE');
	if(Type!=this.Meta)for(let i=0,l=Type.Keys.length;i<l;i++)if(!Type.Keys[i] in Element)throw new this.OPERR('BAD_TYPE');
	return Type;
}
B.prototype.Scrub=async function(Type,Options,Meta,Partial){
	let Shell={};
	if(!Partial){
		for(let i=0,l=this.Meta.Keys.length;i<l;i++)if(!this.Meta.Keys[i] in Options)throw new this.OPERR('BAD_TYPE');
		if(Type!=this.Meta)for(let i=0,l=Type.Keys.length;i<l;i++)if(!Type.Keys[i] in Options)throw new this.OPERR('BAD_TYPE');
		for(let i=0,l=Type.Required.length;i<l;i++)if(!Type.Required[i] in Options)throw new this.OPERR('BAD_TYPE');
	}
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++){
		if(o[i]==this.Identifier||this.Meta.Keys.includes(o[i]))continue;
		Options[o[i]]=await Type.Options[o[i]](Options[o[i]],Shell,Meta,this).catch(E=>{throw new this.OPERR('BAD_OPTION')});
		Shell[o[i]]=Options[o[i]];
	}
}
B.prototype.Key=function(Source,Target){
	if(typeof Target=='object'&&Target!==null)for(let i=0,l=this.Meta.Keys.length;i<l;i++){
		if(Source[this.Meta.Keys[i]]===undefined)throw new this.OPERR('BAD_TYPE');
		Target[this.Meta.Keys[i]]=Source[this.Meta.Keys[i]];
		return;
	}
	let Shell={};
	for(let i=0,l=this.Meta.Keys.length;i<l;i++){
		if(Source[this.Meta.Keys[i]]===undefined)throw new this.OPERR('BAD_TYPE');
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
	if(!this.Testers[Test].apply(this,Inputs))throw new Error(Test);
}
B.prototype.Testers={
	CONSOLE:function(Value){
		if(typeof Value!='object'||Value===null)return false;
		let Required=Object.keys(this.Log);
		for(let i=0,l=Required.length;i<l;i++)if(!(Required[i] in Value)||typeof Value[Required[i]]!='string')return false;
		return true;
	},
	NAME:function(Value){return typeof Value=='string'},
	API:function(Value){return(typeof Value=='object'&&typeof Value.Search=='function'&&typeof Value.Create=='function'&&typeof Value.Read=='function'&&typeof Value.Update=='function'&&typeof Value.Delete=='function')},
	FUNCTION:function(Value){return typeof Value=='function'},
	OPTIONS:function(Options,Required,Keys,Meta){
		if(!Meta&&typeof this.Identifier!='string')return false;
		if(typeof Options!='object'||Options==null||!Array.isArray(Required)||!Array.isArray(Keys))return false;
		if(!Meta)for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(this.Meta.Keys.includes(o[i])||o[i]==this.Identifier)return false;
		for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(!(Options[o[i]] in this.Inputs))return false;
		for(let i=0,l=Required.length;i<l;i++)if(!(Required[i] in Options))return false;
		for(let i=0,l=Keys.length;i<l;i++)if(!(Keys[i] in Options))return false;
		return true;
	},
	STORE:function(Value){return Value in this.Stores},
}
B.prototype.Log={
	CONSOLE:'The Console parameter did not contain the necessary messages',
	NAME:'The Name parameter was not a string',
	API:'The API parameter was not valid',
	FUNCTION:'The Function parameter was not a function',
	OPTIONS:'Validation of the Options, Required, and Keys parameters failed',
	STORE:'The Store parameter did not match a registered Store',
	AUTHORIZATION_FAILED:'The Auth parameter function returned false',
	BAD_TYPE:'The input provided contained an invalid type',
	BAD_OPTION:'The input provided contained an invalid type option',
	BAD_STORE:'The Store parameter did not match a registered Store',
	BAD_API_CALL:'The API was given a request that did not match a registered engine',
}
//B.Documentation=function(File){}
module.exports=B