//# BORG Framework
//- Broadscale Organizational Resource Generator
function B(Settings){
	this.Stores={};
	this.Inputs={};
	this.Types={};
	this.Engines={};
	this.Settings={};
	this.Settings=this.V('Settings',Settings)?Settings:{};
}
B.prototype.Store=function(Name,API){
	if(this.V('Name',Name)&&this.V('API',API))this.Stores[Name]=API;
	else throw new Error(this.E('CONFIGFAILURE'));
}
B.prototype.Input=function(Name,Function){
	if(this.V('Name',Name)&&this.V('Function',Function))this.Inputs[Name]=Function;
	else throw new Error(this.E('CONFIGFAILURE'));
}
B.prototype.Meta=function(Options,Store,Required,Keys){
	if(this.V('Options',Options)&&this.V('Store',Store)&&this.V('Required',Required,false)&&this.V('RequiredOptions',{Required:Required?Required:[],Options:Options})&&this.V('Keys',Keys,false)&&this.V('KeyOptions',{Keys:Keys,Options:Options}))this.Meta={Store:this.Stores[Store],Options:this.Map(Options,true),Required:Required?Required:[],Keys:Keys};
	else throw new Error(this.E('CONFIGFAILURE'));
}
B.prototype.Type=function(Name,Options,Store,Required){
	if(!this.Meta)throw new Error(this.E('CONFIGFAILURE'));
	if(this.V('Name',Name)&&this.V('Options',Options)&&this.V('Store',Store)&&this.V('Required',Required,false)&&this.V('RequiredOptions',{Required:Required?Required:[],Options:Options}))this.Types[Name]={Store:this.Stores[Store],Options:this.Map(Options),Required:Required?Required:[]};
	else throw new Error(this.E('CONFIGFAILURE'));
}
B.prototype.Engine=function(Name,Function){
	if(this.V('Name',Name)&&this.V('Function',Function))this.Engines[Name]=Function
} 
B.prototype.Map=function(Options,Meta){
	if(!Meta&&this.Meta.Keys.some(E=>E in Options))throw new Error(this.E('CONFIGFAILURE'));
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	if(!Meta)for(let i=0,l=this.Meta.Keys.length;i<l;i++)Shell[this.Meta.Keys[i]]=this.Inputs[this.Meta.Options[this.Meta.Keys[i]]];
	return Shell;
}
B.prototype.Authenticate=function(Auth,Action,Meta){return typeof this.Settings.Authenticate=='function'?this.Settings.Authenticate(Auth,Action,Meta):true}
B.prototype.Scrub=async function(Type,Data,Meta){
	if(typeof Data!='object'||Data===null)return false
	let Shell={}
	for(let i=0,l=this.Meta.Keys.length;i<l;i++){
		if(this.Meta.Keys[i] in Shell)continue;
		let V=await this.Meta.Options[this.Meta.Keys[i]](Data[this.Meta.Keys[i]],this,Meta);
		if(V===false)return false;
		else Shell[this.Meta.Keys[i]]=V;
	}
	if(Type===null){
		for(let i=0,l=this.Meta.Required.length;i<l;i++){
			if(this.Meta.Required[i] in Shell)continue;
			let V=await this.Meta.Options[this.Meta.Required[i]](Data[this.Meta.Required[i]],this,Meta);
			if(V===false)return false;
			else Shell[this.Meta.Required[i]]=V;
		}
		for(let i=0,o=Object.keys(this.Meta.Options),l=o.length;i<l;i++){
			if(o[i] in Shell)continue;
			let V=await this.Meta.Options[o[i]](Data[o[i]],this,Meta);
			if(V!==false)Shell[o[i]]=V;
		}
	}else if(Type in this.Types){
		for(let i=0,l=this.Types[Type].Required.length;i<l;i++){
			if(this.Types[Type].Required[i] in Shell)continue;
			let V=await this.Types[Type].Options[this.Types[Type].Required[i]](Data[this.Types[Type].Required[i]],this,Meta);
			if(V===false)return false;
			else Shell[this.Types[Type].Required[i]]=V;
		}
		for(let i=0,o=Object.keys(this.Types[Type].Options),l=o.length;i<l;i++){
			if(o[i] in Shell||!(o[i] in Data))continue;
			let V=await this.Types[Type].Options[o[i]](Data[o[i]],this,Meta);
			if(V!==false)Shell[o[i]]=V;
		}
	}else return false;
	return Shell;
}
B.prototype.Identify=function(Element){
	if(!Element)return false;
	let O=Object.keys(Element);
	let T=Object.keys(this.Types);
	let Ts=[];
	for(let i=0,l=T.length;i<l;i++)if(O.every(E=>E in this.Types[T[i]].Options))Ts.push(T[i]);
	if(Ts.length!=1)return false;
	else return Ts[0];
}
B.prototype.Key=function(Meta,Type){
	for(let i=0,l=this.Meta.Keys.length;i<l;i++)Type[this.Meta.Keys[i]]=Meta[this.Meta.Keys[i]];
}
B.prototype.E=function(E,Lang){
	if(typeof Lang=='string'&&Lang in this.Languages&&typeof this.Languages[Lang]=='object'&&E in this.Languages[Lang])return this.Languages[Lang][E];
	else if(this.Settings.Errors&&E in this.Settings.Error)return this.Settings.Error[E];
	else if(E in this.English)return this.English[E];
	else return 'An unexpected error prevented normal operation of the framework';
}
B.prototype.V=function(Name,Value,Required=true){
	if(typeof Name!='string')throw new Error(this.E('BADNAME'));
	if(!(Name in this.Names))throw new Error(this.E('MISSINGNAME'));
	return Required?this.Names[Name].call(this,Value):typeof Value=='undefined'||Value===null?true:this.Names[Name].call(this,Value);
}
B.prototype.Names={
	Name:function(Name){return typeof Name=='string'},
	API:function(API){return (typeof API=='object'&&typeof API.Create=='function'&&typeof API.Read=='function'&&typeof API.Update=='function'&&typeof API.Delete=='function')},
	Function:function(Function){return typeof Function=='function'},
	Options:function(Options){
		if(typeof Options!='object')return false;
		for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++){
			if(!(Options[o[i]] in this.Inputs))return false;
		}
		return true;
	},
	Store:function(Store){return (typeof Store=='string'&&Store in this.Stores)},
	Engine:function(Engine){return (typeof Engine=='string'&&Engine in this.Engines)},
	Required:function(Required){return Array.isArray(Required)},
	RequiredOptions:function(Inputs){
		if(typeof Inputs!='object'||!Array.isArray(Inputs.Required)||typeof Inputs.Options!='object')return false;
		if(Inputs.Required.length==0)return true;
		return Inputs.Required.every(E=>{return E in Inputs.Options});
	},
	Keys:function(Keys){return (Array.isArray(Keys)&&Keys.length>0)},
	KeyOptions:function(Inputs){
		if(typeof Inputs!='object'||!Array.isArray(Inputs.Keys)||Inputs.Keys.length==0||typeof Inputs.Options!='object')return false;
		return Inputs.Keys.every(E=>{return E in Inputs.Options});
	},
	Filters:function(Filters){
		if(typeof Filters!='Object'||Filters===null)return false;
		for(let i=0,o=Object.keys(Filters),l=o.length;i<l;i++){
			if(!Filters[o[i]] in this.Types)return false;
			else if(typeof Filters[o[i]]=='object'||Filters[o[i]]!==null)for(let i2=0,o2=Object.keys(Filters[o[i]]),l2=o2.length;i2<l2;i2++)if(!o2[i2] in this.Types[Filters[o[i]]]||typeof Filters[o[i]][o2[i2]]!='boolean')return false;
			else if(typeof Filters[o[i]]!='boolean')return false;
		}
		return true;
	},
	Filter:function(Filter){
		if(typeof Filter!='Object'||Filter===null)return false;
		for(let i=0,o=Object.keys(Filter),l=o.length;i<l;i++)if(!Filter[o[i]] in this.Meta.Options)return false;
		return true;
	},
	Settings:function(Settings){
		if(typeof Settings!='object'||Settings===null)return false;
		if(Settings.Authenticate&&typeof Settings.Authenticate!='function')return false;
		if(Settings.Error&&typeof Settings.Error!='object')return false;
		return true;
	},
	Data:function(Data){
		if(!Array.isArray(Data))return false;
		for(let i=0,l=Data.length;i<l;i++)if(typeof Data[i]!='object'||Data[i]===null||!this.Identify(Data[i]))return false;
		return true;
	},
};
B.prototype.Create=async function(Meta,Data,Auth,Lang){
	let Authorized=this.Authenticate(Auth,1);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	Meta=await this.Scrub(null,Meta,Meta);
	if(!Meta)return this.E('BADTYPE',Lang);
	if(Data&&!this.V('Data',Data))return false;
	let Recipt=true;
	let Success=await this.Meta.Store.Create(Meta,this);
	if(!Success)return false;
	else if(Recipt&&!Success)Recipt=false;
	if(Data)for(let i=0,l=Data.length;i<l;i++){
		let Type=await this.Identify(Data[i]);
		let Element=await this.Scrub(Type,Data[i],Meta);
		if(!Element)return this.E('BADTYPE',Lang);
		this.Key(Meta,Element);
		let Result=await this.Types[Type].Store.Create(Element,this);
		if(Recipt&&!Result)Recipt=false;
	}
	let Keys={};
	for(let i=0,l=this.Meta.Keys.length;i<l;i++)Keys[this.Meta.Keys[i]]=Meta[this.Meta.Keys[i]];
	return Keys;
}
B.prototype.Search=async function(){
	// SEARCH ENGINE HERE
}
B.prototype.Read=async function(Keys,Engine,Auth,Lang){
	let Authorized=this.Authenticate(Auth,1);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	if(!this.V('Engine',Engine))return false;
	let Meta=await this.Meta.Store.Read(Keys,this);
	if(!Meta)return this.E('MISSING'); 
	let Data=[];
	let StoresQueried=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(StoresQueried.includes(this.Types[o[i]].Store))continue;
		else StoresQueried.push(this.Types[o[i]].Store);
		let D=await this.Types[o[i]].Store.Read(Keys,this);
		if(D)for(let n=0,s=D.length;n<s;n++)Data.push(D[n]);
	}
	let Render=await this.Engines[Engine](Meta,Data,this);
	return Render;
}










B.prototype.Update=async function(Keys,Element,Update,Auth,Lang){
	console.log('Update:');
	console.log(Element);
	console.log(Update);
	let Meta=await this.Meta.Store.Read(Keys,this);
	if(!Meta)return this.E('MISSING');
	let Authorized=this.Authenticate(Auth,2,Meta);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	let MetaE=await this.Scrub(null,Element,Meta);
	let EType=this.Identify(Element);
	let UType=this.Identify(Update);
	if(MetaE)return await this.Meta.Store.Update(MetaE,Update,this);
	else if(EType&&UType&&EType==UType){
		let E=await this.Scrub(EType,Element,Meta);
		let U=await this.Scrub(UType,Update,Meta);
		if(!E||!U)return this.E('BADTYPE',Lang);
		this.Key(Meta,E);
		return await this.Types[EType].Store.Update(E,U,this);
	}else if(!EType&&UType){
		let E=await this.Scrub(UType,Update,Meta);
		if(!E)return this.E('BADTYPE',Lang);
		this.Key(Meta,E);
		return await this.Types[UType].Store.Create(E,this);
	}else if(EType&&!UType){
		let E=await this.Scrub(EType,Element,Meta);
		if(!E)return this.E('BADTYPE',Lang);
		this.Key(Meta,E);
		return await this.Types[EType].Store.Delete(E,this);
	}else return this.E('BADTYPE',Lang);
}













B.prototype.Delete=async function(Keys,Auth,Lang){
	let Meta=await this.Meta.Store.Read(Keys,this);
	if(!Meta)return this.E('MISSING');
	let Authorized=this.Authenticate(Auth,2,Meta);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	let Recipt=true;
	let StoresQueried=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(StoresQueried.includes(this.Types[o[i]].Store))continue;
		else StoresQueried.push(this.Types[o[i]].Store);
		let Result=await this.Types[o[i]].Store.Delete(Keys,true,this);
		if(Recipt&&!Result)Recipt=false;
	}
	delete StoresQueried;
	let Result=await this.Types.Meta.Store.Delete(Keys,false,this);
	if(Recipt&&!Result)Recipt=false;
	return Recipt;
}
//B.Router=function(){}
//B.Router.prototype.Assign=function(Name,Handler,Framework){}
//B.Router.prototype.Process=function(Name,Input){}
//B.Documentation=function(){}
B.prototype.English={
	CONFIGFAILURE:'A configuration process failed without throwing an error',
	BADNAME:'The Name provided was not a string',
	MISSINGNAME:'The Name provided was not in the list of valid Names',
	ACCESSDENIED:'You are not authorized to perform the action you attempted',
	MISSING:'The resource you requested was not found',
	BADTYPE:'The input provided contained an invalid type',
	BADENGINE:'The requested format was not valid',
	BADFILTER:'The search filters provided were not valid',
	BADFILTERS:'The filters provided were not valid',
	BADUPDATE:'The Update request was invalid, or did not contain enough information',
};
B.prototype.Languages={};
module.exports=B