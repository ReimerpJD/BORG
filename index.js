function Framework(){
	this.Stores={};
	this.Options={};
	this.Types={};
	this.Engines={};
}
Framework.prototype.Store=function(Name,API){
	let Log=[];
	if(typeof Name!='string'||Array.isArray(Name))Log.push('The Name parameter given was not a string');
	if(typeof API!='object')Log.push('The API given was not an object');
	if(typeof API=='object'){
		if(!API.Create)Log.push('The API given was not equipped with the Create method')else if(typeof API.Create!='function')Log.push('The Create property of API given was not a function');
		if(!API.Read)Log.push('The API given was not equipped with the Read method')else if(typeof API.Read!='function')Log.push('The Read property of API given was not a function');
		if(!API.Update)Log.push('The API given was not equipped with the Update method')else if(typeof API.Update!='function')Log.push('The Update property of API given was not a function');
		if(!API.Delete)Log.push('The API given was not equipped with the Delete method')else if(typeof API.Delete!='function')Log.push('The Delete property of API given was not a function');
	}
	if(!this.Stores)Log.push('The Stores object was missing')else if(this.Stores!='object')Log.push('The Stores property was not an object');
	if(Log.length>0)throw new Framework.Admin.Error('Store Addition Failed',Log);
	this.Stores[Name]=API;
}
Framework.prototype.Option=function(Option,Validator){
	let Log=[];
	if(typeof Option!='string'||Array.isArray(Option))Log.push('The Option parameter given was not a string')else if(Option.length>1)Log.push('The Option parameter was an empty string');
	if(typeof Validator!='function')Log.push('The Validator parameter given was not a function');
	if(!this.Options)Log.push('The Options object was missing')else if(this.Options!='object')Log.push('The Options property was not an object');
	if(Log.length>0)throw new Framework.Admin.Error('Option Addition Failed',Log);
	this.Options[Option]=Validator;
}
Framework.prototype.Meta=function(Options,Store,Key,Required){
	let Log=[];
	if(!Array.isArray(Options))Log.push('The Options parameter given was not an array')else if(typeof this.Options=='object'){
		let a=Options.filter(E=>{!(E in this.Options)});
		if(a.length>0)for(let i=0,l=a.length;i++)Log.push(`The Options parameter contained an invalid option (${(typeof a[i]==string&&!Array.isArray(a[i]))?a[i]:`index ${i}`})`);
	}
	if(typeof Store!='string'||Array.isArray(Store)){Log.push('The Store parameter given was not a string')}else if(Store.length>1){Log.push('The Store parameter was an empty string')}else if(typeof this.Stores=='object'&&!(Store in this.Stores)){Log.push(`The Store parameter was invalid (${Store})`)}
	if(!(Key in Options)||!(Key in this.Options))Log.push(`The Key given was not a valid Option (${(typeof Key=='string'&&!Array.isArray(Key))?Key:'it was not a string'})`);
	if(Required&&!Array.isArray(Required)){Log.push('The Required parameter given was not an array')}else if(Required.every(E=>{E in Options})){Log.push('The Required parameter contained invalid entries')}
	if(!this.Options)Log.push('The Options object was missing')else if(this.Options!='object')Log.push('The Options property was not an object');
	if(!this.Stores)Log.push('The Stores object was missing')else if(this.Stores!='object')Log.push('The Stores property was not an object');
	if(!this.Types)Log.push('The Types object was missing')else if(this.Types!='object')Log.push('The Types property was not an object');
	if(Log.length>0)throw new Framework.Admin.Error('Type Addition Failed',Log);
	this.Types['META']={Store:Store,Options:Options,Key=Key};
}
Framework.prototype.Type=function(Type,Options,Store,Required){
	let Log=[];
	if(typeof Type!='string'||Array.isArray(Type)){Log.push('The Type parameter given was not a string')}else if(Type.length>1){Log.push('The Type parameter was an empty string')}else if(Type=='TYPE'||Type=='META'||Type=='WORK'){Log.push(`The Type parameter given was a reserved word (${Type})`)}
	if(!Array.isArray(Options))Log.push('The Options parameter given was not an array')else if(typeof this.Options=='object'){
		let a=Options.filter(E=>{!(E in this.Options)});
		if(a.length>0)for(let i=0,l=a.length;i++)Log.push(`The Options parameter contained an invalid option (${(typeof a[i]==string&&!Array.isArray(a[i]))?a[i]:`index ${i}`})`);
	}
	if(typeof Store!='string'||Array.isArray(Store)){Log.push('The Store parameter given was not a string')}else if(Store.length>1){Log.push('The Store parameter was an empty string')}else if(typeof this.Stores=='object'&&!(Store in this.Stores)){Log.push(`The Store parameter was invalid (${Store})`)}
	if(Required&&!Array.isArray(Required)){Log.push('The Required parameter given was not an array')}else if(Required.every(E=>{E in Options})){Log.push('The Required parameter contained invalid entries')}
	if(!this.Options)Log.push('The Options object was missing')else if(this.Options!='object')Log.push('The Options property was not an object');
	if(!this.Stores)Log.push('The Stores object was missing')else if(this.Stores!='object')Log.push('The Stores property was not an object');
	if(!this.Types)Log.push('The Types object was missing')else if(this.Types!='object')Log.push('The Types property was not an object');
	if(Log.length>0)throw new Framework.Admin.Error('Type Addition Failed',Log);
	this.Types[Type]={Store:Store,Options:Options};
}
Framework.prototype.Engine=function(Format,Function){
	let Log=[];
	if(typeof Format!='string'||Array.isArray(Format)){Log.push('The Format parameter given was not a string')}else if(Format.length>1){Log.push('The Format parameter was an empty string')}
	if(typeof Function!='function')Log.push('The Function parameter given was not a function');
	if(!this.Engines)Log.push('The Engines object was missing')else if(this.Engines!='object')Log.push('The Engines property was not an object');
	this.Engines[Format]=Function;
}
Framework.prototype.Status=async function(Quietly){
	// Add more Status data? # of Types, Options, Meta Types, Engines, Stores, ...
	let Log=[];
	if(!this.Stores){Log.push('The Stores object was missing')}else if(this.Stores!='object'){Log.push('The Stores property was not an object')}
	else for(let i=0,o=Object.keys(this.Stores),l=o.length;i<l;i++){
		if(typeof this.Stores[o[i]]=='object'){
			if(!this.Stores[o[i]].Create)Log.push(`The Stores ${o[i]} API was not equipped with the Create method`)else if(typeof this.Stores[o[i]].Create!='function')Log.push(`The Create property of the Stores ${o[i]} API was not a function`);
			if(!this.Stores[o[i]].Read)Log.push(`The Stores ${o[i]} API was not equipped with the Read method`)else if(typeof this.Stores[o[i]].Read!='function')Log.push(`The Read property of the Stores ${o[i]} API was not a function`);
			if(!this.Stores[o[i]].Update)Log.push(`The Stores ${o[i]} API was not equipped with the Update method`)else if(typeof this.Stores[o[i]].Update!='function')Log.push(`The Update property of the Stores ${o[i]} API was not a function`);
			if(!this.Stores[o[i]].Delete)Log.push(`The Stores ${o[i]} API was not equipped with the Delete method`)else if(typeof this.Stores[o[i]].Delete!='function')Log.push(`The Delete property of the Stores ${o[i]} API was not a function`);
		}else Log.push(`The Stores ${o[i]} API was not an object`);
	}
	if(!this.Options){Log.push('The Options object was missing')}else if(this.Options!='object'){Log.push('The Options property was not an object')}
	else for(let i=0,o=Object.keys(this.Options),l=o.length;i<l;i++){
		if(typeof this.Options[o[i]]!='function')Log.push(`The Options[${(typeof o[i]!='string'||Array.isArray(o[i]))?o[i]:`number ${i}`}] validator was not a function`);
	}
	if(!this.Types){Log.push('The Types object was missing')}else if(this.Types!='object'){Log.push('The Types property was not an object')}
	else for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
		if(!Array.isArray(this.Types[o[i]].Options))Log.push(`The Types[${(o[i]!='string'||Array.isArray(o[i]))?o[i]:`number ${i}`}] Options parameter was not an array`)else if(typeof this.Options=='object'){
			let a=this.Types[o[i]].Options.filter(E=>{!(E in this.Options)});
			if(a.length>0)for(let i=0,l=a.length;i++)Log.push(`The Types[${(o[i]!='string'||Array.isArray(o[i]))?o[i]:`number ${i}`}] Options parameter contained an invalid option (${(typeof a[i]==string&&!Array.isArray(a[i]))?a[i]:`index ${i}`})`);
		}
		if(typeof this.Types[o[i]].Store!='string'||Array.isArray(this.Types[o[i]].Store))Log.push(`The Types[${(typeof o[i]!='string'||Array.isArray(o[i]))?o[i]:`number ${i}`}] Store parameter was not a string`)else if(typeof this.Stores=='object'&&!(this.Types[o[i]].Store in this.Stores))Log.push(`The Types[${(typeof this.Options[o[i]]!='string'||Array.isArray(Option))?o[i]:`number ${i}`}] Store parameter was invalid`);
	}
	if(!this.Engines){Log.push('The Engines object was missing')}else if(this.Engines!='object'){Log.push('The Engines property was not an object')}
	else for(let i=0,o=Object.keys(this.Engine),i<l;i++)if(typeof this.Engine[o[i]]!='function')Log.push(`The ${(typeof o[i]==='string'&&!Array.isArray(o[i]))?o[i]:`number ${i}`} Engine is not a function`);
	return new Framework.Admin.Error('Status Requested',Log,Quietly);
}

// CHAOS BELOW ##################################################################################################################################################################################################################

Framework.prototype.Process=async function(Request,Authentication){
	// Get Meta
	// Validate Filters and Key
	let Meta=await this.Stores[this.Types.META.Store].Read(Request.Filters,Authentication,this.Stores);
	let Authorized=(typeof this.Authenticate=='function')?this.Authenticate(Authentication,Meta):true;
	// how to call only the necessary stores? check filters fro Types specification, and call necessary Stores
}
Framework.prototype.Flush=async function(){} // delete WIPs/...
Framework.prototype.Workshop=async function(){}
// Validators are async and return the manipulated/passed value

Framework.Router=function(){
	this.Routes={};
}
Framework.Router.prototype.Assign=function(Identifier,Framework,Handler){
	this.Routes[Identifier]={Framework:Framework,Handler:Handler};
}

Framework.Admin={
	Inputs:['undefined','object','boolean','symbol','string','number','bigint','function'],
	Log:(Error)=>{console.log(Error)},
	Error:function(Message,Log,Quiet){
		let E={};
		E.name='BORG';
		E.message=(typeof Message=='string')?Message:'An unexpected error was encountered';
		E.log=(typeof Log=='string')?Log:'';
		E.stack=Error.captureStackTrace(this,Framework.Admin.Error);
		// if Quiet, manually log to console
		return E;
	},
	Catch:function(){} // for catching custom errors and using their data
}
Framework.Documentation=function(File,API){}
Framework.Language={
	Default:false,
	Map:()=>{},
	// ISO 639 Codes
	// Code to name and name to code
	// Built in langauge management tools
}
Framework.Mongo=async function(Options){}
Framework.Accounts=function(){}
// Add error handling mechanisms