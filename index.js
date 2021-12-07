//# BORG Framework
//- Broadscale Organizational Resource Generator

//! Framework constructor function
//= used to generate an instance of the Framework
//: Settings object used to pass the Authenticate function and Error list to the instance
function B(Settings){
	this.Stores={};
	this.Inputs={};
	this.Types={};
	this.Engines={};
	this.Settings=this.V('Settings',Settings)?Settings:{};
}

//! Framework instance Store setting function
//= used to assign Stores to the framework instance
//: Name string identifier used as an object key
//: API
B.prototype.Store=function(Name,API){
	if(this.V('Name',Name)&&this.V('API',API))this.Stores[Name]=API;
	else throw new Error(this.E('CONFIGFAILURE'));
}

//! Framework instance Input setting function
//= used to assign Inputs to the framework instance
//: Name string identifier used as an object key
//: Function function the validator function used on Input values
B.prototype.Input=function(Name,Function){
	if(this.V('Name',Name)&&this.V('Function',Function))this.Inputs[Name]=Function;
	else throw new Error(this.E('CONFIGFAILURE'));
}

//! Framework instance Type setting function
//= used to assign Types to the framework instance
//: Name string identifier used as an object key
//: Options object the Type's inputs (keys) to the Inputs (values) they're defined as and validated with
//: Store string the name of the Store used to store entries of the Type
//: Required array (of strings) the Options which are required for an entry of the Type to be valid
B.prototype.Type=function(Name,Options,Store,Required){
	if(this.V('Name',Name)&&this.V('Options',Options)&&this.V('Store',Store)&&this.V('Required',Required,false)&&this.V('RequiredOptions',{Required:Required?Required:[],Options:Options}))this.Types[Name]={Store:this.Stores[Store],Options:this.Map(Options),Required:Required?Required:[]};
	else throw new Error(this.E('CONFIGFAILURE'));
}

//! Framework instance Engine setting function
//= used to assign Engines to the framework instance
//: Name string identifier used as an object key
//: Function function the engine itself
B.prototype.Engine=function(Name,Function){
	if(this.V('Name',Name)&&this.V('Function',Function))this.Engines[Name]=Function
}

//! Framework instance Map function
//= used by the Type settting function to connect a Type's Options to defined Inputs 
B.prototype.Map=function(Options){
	let Shell={};
	for(let i=0,o=Object.keys(this.Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	return Shell;
}

//! Framework instance Authenticate function
//= returns whether or not a request is authenticated to perform an action based on the Auth input it provided
B.prototype.Authenticate=function(Auth,Action){return typeof this.Settings.Authenticate=='function'?this.Settings.Authenticate(Auth,Action):true}

//! Framework instance Type Validator function
//= used to validate if entires conform to the Type model they belong to
B.prototype.Validate=function(Type,Item){
	if(!Type in this.Types)return false;
	if(typeof Item!='object')return false;
	if(this.Types[Type].Required.length>0)for(let i=0,l=this.Types[Type].Required.length;i<l;i++)if(!this.Types[Type].Required[i] in Item)return false;
	for(let i=0,o=Object.keys(Item),l=o.length;i<l;i++){if(!o[i] in this.Types[Type].Options||!this.Types[Type].Options[o[i]](Item[o[i]]))return false}
}

//! Framework instance Error Response function
//= used to return an error/message based on teh requested and available languages
B.prototype.E=function(E,Lang){
	if(typeof Lang=='string'&&Lang in this.Languages&&typeof this.Languages[Lang]=='object'&&E in this.Languages[Lang])return this.Languages[Lang][E];
	else if(this.Settings.Errors&&E in this.Settings.Error)return this.Settings.Error[E];
	else if(E in this.English)return this.English[E];
	else return 'An unexpected error prevented normal operation of the framework';
}

//! Framework instance Input Validator function
//= used to validate all configuration/non-Type inputs
B.prototype.V=function(Name,Value,Required=true){
	if(typeof Name!='string')throw new Error(this.E('BADNAME'));
	if(!(Name in this.Names))throw new Error(this.E('MISSINGNAME'));
	return Required?this.Names[Name](Value):typeof Value=='undefined'||Value===null?true:this.Names[Name](Value);
}

//! Framework instance Names object
//= collection of functions used by the Input Validator function for validation
B.prototype.Names={
	Name:function(Name){return typeof Name=='string'},
	API:function(API){return (typeof API=='function'&&typeof API.Create=='function'&&typeof API.Read=='function'&&typeof API.Update=='function'&&typeof API.Delete=='function')},
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
		return Inputs.Required.each(E=>{return E in Inputs.Options});
	},
	Filters:function(Filters){
		if(typeof Filters!='Object'||Filters===null)return false;
		for(let i=0,o=Object.keys(Filters),l=o.length;i<l;i++){
			if(!Filters[o[i]] in this.Types)return false;
			else if(typeof Filters[o[i]]=='object'!!Filters[o[i]]!==null)for(let i2=0,o2=Object.keys(Filters[o[i]]),l2=o2.length;i2<l2;i2++)if(!o2[i2] in this.Types[Filters[o[i]]]||typeof Filters[o[i]][o2[i2]]!='boolean')return false;
			else if(typeof Filters[o[i]]!='boolean')return false;
		}
		return true;
	},
	Filter:function(Filter){
		if(typeof Filter!='Object'||Filter===null)return false;
		for(let i=0,o=Object.keys(Filter),l=o.length;i<l;i++)if(!Filter[o[i]] in this.Meta.Options)return false;
		return true;
	},
};

//! Framework instance Search API function
B.prototype.Search=async function(Filter,Auth,Lang){
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	if(!this.V('Filter',Filter))return this.E('BADFILTER');
	let Authorized=this.Authenticate(Auth,0);
	return await this.Types.Meta.Store.Read(null,Filter,this.Stores);
}

//! Framework instance Create API function
B.prototype.Create=async function(Meta,Auth,Lang){
	let Authorized=this.Authenticate(Auth,2);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	let M=this.Validate('Meta',Meta);
	if(!M)return this.E('BADTYPE',Lang);
	Meta=M;
	return await this.Types.Meta.Store.Create(Meta,this.Stores);
}

//! Framework instance Read API function
B.prototype.Read=async function(ID,Engine,Filters,Auth,Lang){
	if(!this.V('Filters',Filters))return this.E('BADFILTERS');
	if(!this.V('Engine',Engine))return this.E('BADENGINE');
	let M=await this.Types.Meta.Store.Read(ID,Filters.Meta,this.Stores);
	if(!M)return this.E('MISSING');
	let Authorized=this.Authenticate(Auth,1,M);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	let D=[];
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		let d=await this.Types[o[i]].Store.Read(ID,Filters[o[i]],this.Stores);
		if(d)D.push(d);
	}
	if(Engine)return await this.Engines[Engine](M,D,this,Auth);
	else return {Meta:M,Data:D};
}

//! Framework instance Update API function
B.prototype.Update=function(ID,Type,UID,Data,Auth,Lang){
	let M=await this.Types.Meta.Store.Read(ID,null,this.Stores);
	if(!M)return this.E('MISSING');
	let Authorized=this.Authenticate(Auth,2,M);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	if(!this.Validate('Type',Type))return this.E('BADTYPE',Lang);
	let N=this.Types[Type].Store.Read(ID,{UID:UID},this.Stores);
	if(!N)return this.E('MISSINGUID');
	let D=this.Validate('Type',Data);
	if(!D)return this.E('BADTYPE',Lang);
	Data=D;
	return await this.Types[Type].Store.Update(ID,UID,Data,this.Stores);
}
	
B.prototype.Update=function(ID,Data,Element,Auth,Lang){
	// add return errors for failures (rather than return false)
	let M=await this.Types.Meta.Store.Read(ID,null,this.Stores);
	if(!M)return this.E('MISSING');
	let Authorized=this.Authenticate(Auth,2,M);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	// validate ID, Data, Element, Auth, Lang
	
	
	
	// check against all elements (don't specify meta because it's in types)
	var Type;
	if(!Element||typeof Element!=object||Element.Type=='Meta')Type=['Meta'];
	else if(Element.Type&&Element.Type in this.Types)Type=[Element.Type];
	else if(typeof Element=='object'){
		let O=Object.keys(Element);
		let T=Object.keys(this.Types);
		let Ts=[];
		for(let i=0,l=T.length;i<l;i++)if(O.each(E=>E in this.Types[T[i]]))Ts.push(T[i]);
		if(Ts.length==0)return false;
	}else return false;
}

//! Framework instance Delete API function
B.prototype.Delete=function(ID,Auth,Lang){
	let M=await this.Types.Meta.Store.Read(ID,null,Auth,this.Stores);
	if(!M)return this.E('MISSING');
	let Authorized=this.Authenticate(Auth,2,M);
	if(!Authorized)return this.E('ACCESSDENIED',Lang);
	let S=await this.Types.Meta.Store.Delete(ID,this.Stores);
	for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		let s=await this.Types[o[i]].Store.Delete(ID,this.Stores);
		if(!s)S=false;
	}
	return S;
}

//B.Router=function(){}
//B.Router.prototype.Assign=function(Name,Handler,Framework){}
//B.Router.prototype.Process=function(Name,Input){}
//B.Documentation=function(){}
//! Framework Errors in English
//- used as the default collection of Errors
B.English={
	CONFIGFAILURE:'A configuration process failed without throwing an error',
	BADNAME:'The Name provided was not a string',
	MISSINGNAME:'The Name provided was not in the list of valid Names',
	BADAPI:'The API parameter given was not valid',
	BADFUCTION:'The Function parameter given was not valid',
	BADOPTIONS:'The Options parameter given was not valid',
	BADSTORE:'The Store parameter given was not valid',
	BADREQUIRED:'The Required parameter given was not valid',
	ACCESSDENIED:'You are not authorized to perform the action you attempted',
	MISSING:'The resource you requested was not found',
	BADTYPE:'The input provided contained an invalid type',
	BADENGINE:'The requested format was not valid',
	BADFILTER:'The search filters provided were not valid',
	BADFILTERS:'The filters provided were not valid',
	MISSINGUID:'The UID parameter given was not valid for the Type provided',
};

//! Framework Language Object
//= used to house additional Errors in different forms or languages
B.Languages={};