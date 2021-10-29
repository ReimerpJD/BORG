function Framework(Settings){
	this.Log=new Framework.Log();
	this.Stores={};
	this.Inputs={};
	this.Types={};
	this.Engines={};
	this.Settings=this.Log.S('Settings',Settings);
}
Framework.prototype.Store=function(Name,API){if(this.Log.C(true).V('Name',Name).V('API',API).F())this.Stores[Name]=API}
Framework.prototype.Input=function(Name,Function){if(this.Log.C(true).V('Name',Name).V('Function',Function).P())this.Inputs[Name]=Function}
Framework.prototype.Type=function(Name,Options,Store,Required){if(this.Log.C(true).V('Name',Name).V('Options',Options).V('Store',Store).V('Options',Required,{Set:Options}).P())this.Types[Name]={Store:this.Stores[Store],Options:this.Map(Options)}}
Framework.prototype.Engine=function(Name,Function){if(this.Log.C(true).V('Name',Name).V('Function',Engine).P())this.Engines[Name]=Function}
Framework.prototype.Map=function(Options){
	let Shell={};
	for(let i=0,o=Object.keys(this.Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	return Shell;
}
Framework.prototype.Create=function(Data,Auth){} // finish
Framework.prototype.Read=function(ID,Filters,Auth){} // finish
Framework.prototype.Update=function(ID,Data,Auth){} // finish
Framework.prototype.Delete=function(ID,Recursive,Auth){} // finish
Framework.Router=function(){} // finish
Framework.Router.prototype.Assign=function(Name,Handler,Framework){} // finish
Framework.Router.prototype.Process=function(Name,Inputs){} // finish
Framework.Log=function(){ // finish
	this.Errors=[];
	this.Warning=[];
	this.Messages=[];
	this.Critical=false;
}
Framework.Log.prototype.C=function(Throw,Flush){} // set throw error on critical flush to true/false (automatically flush unless param 2 is true)
Framework.Log.prototype.S=function(Kind,Value){} // Scrub and return
Framework.Log.prototype.V=function(Kind,Value){} // validate and return bool
Framework.Log.prototype.F=function(Ignore){} // flush to stderr/stdout and return !Critical (force Ignore critical)
Framework.Log.prototype.E=function(){} // return error obejct
Framework.Log.prototype.Validators={
	// all add timestamp before logging messages
	Name:Value=>{},
	API:Value=>{},
	Function:Value=>{},
	Options:Value=>{}
}
Framework.Log.prototype.Scrubbers={
	// all add timestamp before logging messages
	Settings:Value=>{
		// Error handler function
		// Error message array (if none use default)
		// Authentication function
		// to or not to preserve old versions of documents
	}
}
Framework.Log.prototype.Errors={ // finish
	en:{}
}
Framework.Documentation=function(File){} // finish





function Framework(Settings){
	
	// Authentication: f( {=}, {?}META)
	// Stats.Log: f( {?}, {=}, ...?){})
	// Error: f( {?}, {=}, {*})
	this.Settings={};
	// Filter Settings for valid values
	// Keep past versions of documents, ...
	
	this.Stores={};
	this.Options={};
	this.Types={};
	this.Engines={};
}
Framework.prototype.Store=function(Name,API){
	let Stats={Critical:false,Log:[]};
	this.Validate.Name(Name,Stats);
	this.Validate.Store(API,Stats);
	if(Stats.Critical)throw new Framework.Admin.Error(Stats.Log);
	this.Stores[Name]=API;
	
	/*let Stats.Log=[];
	if(typeof Name!='string'||Array.isArray(Name))Stats.Log.push(Framework.Admin.Errors[0]());
	if(typeof API!='object')Stats.Log.push(Framework.Admin.Errors[1]());
	if(typeof API=='object'){
		if(!API.Create){Stats.Log.push(Framework.Admin.Errors[2]())}else if(typeof API.Create!='function'){Stats.Log.push(Framework.Admin.Errors[3]())}
		if(!API.Read){Stats.Log.push(Framework.Admin.Errors[4]())}else if(typeof API.Read!='function'){Stats.Log.push(Framework.Admin.Errors[5]())}
		if(!API.Update){Stats.Log.push(Framework.Admin.Errors[6]())}else if(typeof API.Update!='function'){Stats.Log.push(Framework.Admin.Errors[7]())}
		if(!API.Delete){Stats.Log.push(Framework.Admin.Errors[8]())}else if(typeof API.Delete!='function'){Stats.Log.push(Framework.Admin.Errors[9]())}
	}
	if(!this.Stores)Stats.Log.push(Framework.Admin.Errors[10]())else if(this.Stores!='object')Stats.Log.push(Framework.Admin.Errors[11]());
	if(Stats.Log.length>0)throw new Framework.Admin.Error(Framework.Admin.Errors[85](),Stats.Log);
	this.Stores[Name]=API;*/
}
Framework.prototype.Option=function(Option,Validator){
	let Stats={Critical:false,Log:[]};
	this.Validate.Name(Option,Stats);
	this.Validate.Function(Validator,Stats);
	if(Stats.Critical)throw new Framework.Admin.Error(Stats.Log);
	this.Options[Option]=Validator;
	
	/*let Stats.Log=[];
	if(typeof Option!='string'||Array.isArray(Option)){Stats.Log.push(Framework.Admin.Errors[12]())}else if(Option.length>1){Stats.Log.push(Framework.Admin.Errors[13]())}
	if(typeof Validator!='function')Stats.Log.push(Framework.Admin.Errors[14]());
	if(!this.Options){Stats.Log.push(Framework.Admin.Errors[15]())}else if(this.Options!='object'){Stats.Log.push(Framework.Admin.Errors[16]())}
	if(Stats.Log.length>0)throw new Framework.Admin.Error(Framework.Admin.Errors[86](),Stats.Log);
	this.Options[Option]=Validator;*/
}
Framework.prototype.Meta=function(Options,Store,Key,Required){
	let Stats={Critical:false,Log:[]};
	this.Validate.ValidOptions(Options,Stats);
	this.Validate.ValidStore(Store,Stats);
	this.Validate.ValidKey(Key,Stats);
	this.Validate.ValidRequired(Required,Stats);
	if(Stats.Critical)throw new Framework.Admin.Error(Stats.Log);
	else this.Types.META={Store:Store,Options:Options,Key:Key,Required:Required};
	
	/*let Stats.Log=[];
	if(!Array.isArray(Options)){Stats.Log.push(Framework.Admin.Errors[17]())}else if(typeof this.Options=='object'){
		let a=Options.filter(E=>{!(E in this.Options)});
		if(a.length>0)for(let i=0,l=a.length;i++)Stats.Log.push(Framework.Admin.Errors[18]());
	}
	if(typeof Store!='string'||Array.isArray(Store)){Stats.Log.push(Framework.Admin.Errors[19]())}else if(Store.length>1){Stats.Log.push(Framework.Admin.Errors[20]())}else if(typeof this.Stores=='object'&&!(Store in this.Stores)){Stats.Log.push(Framework.Admin.Errors[21]())}
	if(!(Key in Options)||!(Key in this.Options))Stats.Log.push(Framework.Admin.Errors[22]());
	if(Required&&!Array.isArray(Required)){Stats.Log.push(Framework.Admin.Errors[23]())}else if(Required.every(E=>{E in Options})){Stats.Log.push(Framework.Admin.Errors[24]())}
	if(!this.Options){Stats.Log.push(Framework.Admin.Errors[25]())}else if(this.Options!='object'){Stats.Log.push(Framework.Admin.Errors[26]())}
	if(!this.Stores){Stats.Log.push(Framework.Admin.Errors[27]())}else if(this.Stores!='object'){Stats.Log.push(Framework.Admin.Errors[28]())}
	if(!this.Types){Stats.Log.push(Framework.Admin.Errors[29]())}else if(this.Types!='object'){Stats.Log.push(Framework.Admin.Errors[30]())}
	if(Stats.Log.length>0)throw new Framework.Admin.Error(Framework.Admin.Errors[87](),Stats.Log);
	this.Types['META']={Store:Store,Options:Options,Key:Key};*/
}
Framework.prototype.Type=function(Type,Options,Store,Required){
	let Stats={Critical:false,Log:[]};
	this.Validate.Name(Type,Stats);
	this.Validate.ValidOptions(Options,Stats);
	this.Validate.ValidStore(Store,Stats);
	this.Validate.ValidRequired(Required,Stats);
	if(Stats.Critical)throw new Framework.Admin.Error(Stats.Log);
	this.Types[Type]={Store:Store,Options:Options};
	
	/*let Stats.Log=[];
	if(typeof Type!='string'||Array.isArray(Type)){Stats.Log.push(Framework.Admin.Errors[31]())}else if(Type.length>1){Stats.Log.push(Framework.Admin.Errors[32]())}else if(Framework.Admin.Reserved.includes(Type)){Stats.Log.push(Framework.Admin.Errors[33]())}
	if(!Array.isArray(Options))Stats.Log.push(Framework.Admin.Errors[34]())else if(typeof this.Options=='object'){
		let a=Options.filter(E=>{!(E in this.Options)});
		if(a.length>0)for(let i=0,l=a.length;i++)Stats.Log.push(Framework.Admin.Errors[35]());
	}
	if(typeof Store!='string'||Array.isArray(Store)){Stats.Log.push(Framework.Admin.Errors[36]())}else if(Store.length>1){Stats.Log.push(Framework.Admin.Errors[37]())}else if(typeof this.Stores=='object'&&!(Store in this.Stores)){Stats.Log.push(Framework.Admin.Errors[38]())}
	if(Required&&!Array.isArray(Required)){Stats.Log.push(Framework.Admin.Errors[39]())}else if(Required.every(E=>{E in Options})){Stats.Log.push(Framework.Admin.Errors[40]())}
	if(!this.Options){Stats.Log.push(Framework.Admin.Errors[41]())}else if(this.Options!='object'){Stats.Log.push(Framework.Admin.Errors[42]())}
	if(!this.Stores){Stats.Log.push(Framework.Admin.Errors[43]())}else if(this.Stores!='object'){Stats.Log.push(Framework.Admin.Errors[44]())}
	if(!this.Types){Stats.Log.push(Framework.Admin.Errors[45]())}else if(this.Types!='object'){Stats.Log.push(Framework.Admin.Errors[46]())}
	if(Stats.Log.length>0)throw new Framework.Admin.Error(Framework.Admin.Errors[88](),Stats.Log);
	this.Types[Type]={Store:Store,Options:Options};*/
}
Framework.prototype.Engine=function(Format,Function){
	let Stats={Critical:false,Log:[]};
	this.Validate.Name(Format,Stats);
	this.Validate.Function(Function,Stats);
	if(Stats.Critical)throw new Framework.Admin.Error(Stats.Log);
	this.Engines[Format]=Function;
	
	/*let Stats.Log=[];
	if(typeof Format!='string'||Array.isArray(Format)){Stats.Log.push(Framework.Admin.Errors[47]())}else if(Format.length>1){Stats.Log.push(Framework.Admin.Errors[48]())}
	if(typeof Function!='function')Stats.Log.push(Framework.Admin.Errors[49]());
	if(!this.Engines)Stats.Log.push(Framework.Admin.Errors[50]())else if(this.Engines!='object')Stats.Log.push(Framework.Admin.Errors[51]());
	if(Stats.Log.length>0)throw new Framework.Admin.Error(Framework.Admin.Errors[89](),Stats.Log);
	this.Engines[Format]=Function;*/
}
Framework.prototype.Status=async function(Quietly){
	// Here
	return new Framework.Admin.Error(Stats.Log);
	/*let Stats.Log=[];
	if(!this.Stores){Stats.Log.push(Framework.Admin.Errors[52]())}else if(this.Stores!='object'){Stats.Log.push(Framework.Admin.Errors[53]())}
	else{
		Stats.Log.push(Framework.Admin.Errors[54]());
		for(let i=0,o=Object.keys(this.Stores),l=o.length;i<l;i++){
			Stats.Log.push(Framework.Admin.Errors[55]());
			if(typeof this.Stores[o[i]]=='object'){
				if(!this.Stores[o[i]].Create){Stats.Log.push(Framework.Admin.Errors[56]())}else if(typeof this.Stores[o[i]].Create!='function'){Stats.Log.push(Framework.Admin.Errors[57]())}
				if(!this.Stores[o[i]].Read){Stats.Log.push(Framework.Admin.Errors[58]())}else if(typeof this.Stores[o[i]].Read!='function'){Stats.Log.push(Framework.Admin.Errors[59]())}
				if(!this.Stores[o[i]].Update){Stats.Log.push(Framework.Admin.Errors[60]())}else if(typeof this.Stores[o[i]].Update!='function'){Stats.Log.push(Framework.Admin.Errors[61]())}
				if(!this.Stores[o[i]].Delete){Stats.Log.push(Framework.Admin.Errors[62]())}else if(typeof this.Stores[o[i]].Delete!='function'){Stats.Log.push(Framework.Admin.Errors[63]())}
			}else Stats.Log.push(Framework.Admin.Errors[64]());
		}
	}
	if(!this.Options){Stats.Log.push(Framework.Admin.Errors[65]())}else if(this.Options!='object'){Stats.Log.push(Framework.Admin.Errors[66]())}
	else{
		Stats.Log.push(Framework.Admin.Errors[67]());
		for(let i=0,o=Object.keys(this.Options),l=o.length;i<l;i++){
			Stats.Log.push(Framework.Admin.Errors[68]());
			if(typeof this.Options[o[i]]!='function')Stats.Log.push(Framework.Admin.Errors[69]());
		}
	}
	if(!this.Types){Stats.Log.push(Framework.Admin.Errors[70]())}else if(this.Types!='object'){Stats.Log.push(Framework.Admin.Errors[71]())}
	else{
		Stats.Log.push(Framework.Admin.Errors[72]());
		for(let i=0,o=Object.keys(this.Types),l=o.length;i<l;i++){
			Stats.Log.push(Framework.Admin.Errors[73]());
			if(o[i]=='META')Stats.Log.push(Framework.Admin.Errors[74]());
			if(!Array.isArray(this.Types[o[i]].Options)){Stats.Log.push(Framework.Admin.Errors[75]())}else if(typeof this.Options=='object'){
				let a=this.Types[o[i]].Options.filter(E=>{!(E in this.Options)});
				if(a.length>0)for(let i=0,l=a.length;i++)Stats.Log.push(Framework.Admin.Errors[76]());
			}
			if(typeof this.Types[o[i]].Store!='string'||Array.isArray(this.Types[o[i]].Store)){Stats.Log.push(Framework.Admin.Errors[77]())}else if(typeof this.Stores=='object'&&!(this.Types[o[i]].Store in this.Stores)){Stats.Log.push(Framework.Admin.Errors[78]())}
		}
	}
	if(!this.Engines){Stats.Log.push(Framework.Admin.Errors[79]())}else if(this.Engines!='object'){Stats.Log.push(Framework.Admin.Errors[80]())}
	else{
		Stats.Log.push(Framework.Admin.Errors[81]());
		for(let i=0,o=Object.keys(this.Engine),i<l;i++){
			Stats.Log.push(Framework.Admin.Errors[82]());
			if(typeof this.Engine[o[i]]!='function')Stats.Log.push(Framework.Admin.Errors[83]());
		}
	}
	return new Framework.Admin.Error(Framework.Admin.Errors[90](),Stats.Log,Quietly);*/
}

// CHAOS BELOW ##################################################################################################################################################################################################################

Famework.prototype.Validate={
	Name:function(Input,Stats){
		return typeof Input!='string'||Array.isArray(Input)?(Stats.Log.push(Framework.Admin.Errors['E.2.1'](Input)),Stats.Critical=true,false):true;
	},
	Store:function(Input,Stats){
		let Valid=true;
		if(typeof Input!='object'||Input==='undefined')return (Stats.Log.push(Framework.Admin.Errors['E.2.2'](Input)),Stats.Critical=true,false);
		if(typeof Input.Create!='function'){
			Stats.Log.push(Framework.Admin.Errors['E.2.2.1'](Input));
			Stats.Critical=true;
			Valid=false;
		}
		if(typeof Input.Read!='function'){
			Stats.Log.push(Framework.Admin.Errors['E.2.2.2'](Input));
			Stats.Critical=true;
			Valid=false;
		}
		if(typeof Input.Update!='function'){
			Stats.Log.push(Framework.Admin.Errors['E.2.2.3'](Input));
			Stats.Critical=true;
			Valid=false;
		}
		if(typeof Input.Delete!='function'){
			Stats.Log.push(Framework.Admin.Errors['E.2.2.4'](Input));
			Stats.Critical=true;
			Valid=false;
		}
		return Valid;
	},
	Function:function(Input,Stats){
		return typeof Input!='function'?(Stats.Log.push(Framework.Admin.Errors['E.2.3'](Input)),Stats.Critical=true,false):true;
	},
	Request:function(Input,Stats){
		// Query
		// Lang
		// Langs
		// Filters
		// Data
		// Engine
	},
	Query:function(Input,Stats)=>{},
	Language:function(Input,Stats)=>{},
	Languages:function(Input,Stats)=>{},
	Filters:function(Input,Stats)=>{
		// Key
		// Include
		// Exclude
	},
	Key:function(Input,Stats)=>{},
	Include:function(Input,Stats)=>{},
	Exclude:function(Input,Stats)=>{},
	Data:function(Input,Stats)=>{},
	Engine:function(Input,Stats)=>{},
	Authenticate:function(Input,Stats){},
	ValidOptions:function(Input,Stats){},
	ValidStore:function(Input,Stats){},
	ValidKey:function(Input,Stats){},
	ValidRequired:function(Input,Stats){},
}

	Errors:{
		'E.2.1':(Input)=>`The parameter given as an identifier was not a string, its type evaluated to ${typeof Input=='string'?'array':typeof Input}`,
		'E.2.2':(Input)=>`The parameter given as a Store was not an object, its type evaluated to ${typeof Input=='object'?'undefined':typeof Input}`,
		'E.2.2.0':(Query)=>{`The parameter given as a Store had an invalid or missing ${Query} query handler`},
		'E.2.2.1':()=>Framework.Admin.Errors['E.2.2.0']('Create'),
		'E.2.2.2':()=>Framework.Admin.Errors['E.2.2.0']('Read'),
		'E.2.2.3':()=>Framework.Admin.Errors['E.2.2.0']('Update'),
		'E.2.2.4':()=>Framework.Admin.Errors['E.2.2.0']('Delete'),
		'E.2.3':(Input)=>`The parameter given as an function was not a function, its type evaluated to ${typeof Input}`,
		'E.2.4':(Input)=>`The Request given was not an object`,
		'E.2.4.0':(Property)=>`The Request given had an invalid value for the ${Property} property`,
	}

Framework.prototype.Query=async function(Request,Authentication){
	let Stats={Critical:false,Log:[]};
	this.Validate.Request(Request,Stats);
	if(Stats.Critical)throw new Framework.Admin.Error(Stats.Log);
	let Meta=await this.Stores[this.Types.META.Store].Read(Request.Filters,Authentication,this.Stores); // how/why is Authentication used by Stores?
	// Validate eta?
	let Authorized=typeof this.Settings.Authentication=='function'?this.Settings.Authentication(Authentication,Meta):true;
	if(!Authorized)return false; // Figure out what to do here/what the return should be
	
	// Perform task
	
	/*
	let Shell={};
	Stats.Log.concat(this.Validate.Request(Request));
	if(Stats.Log.length==0}Shell.Meta=await this.Meta() // Use function to get META here
	if(this.Validate.Authenticate(this.Settings.Authenticate)){Shell.Access=await this.Settings.Authenticate(Authentication,Shell.Meta)}else{Shell.Access=true}
	*/
	// Get DATA based on filters
	
	
	
	// Send through engine
	
	// Need non-response outputs for status/failures
	

	//let Meta=await this.Stores[this.Types.META.Store].Read(Request.Filters,Authentication,this.Stores);
	//let Authorized=(typeof this.Settings.Authenticate=='function')?this.Authenticate(Authentication,Meta):true;
	// how to call only the necessary stores? check filters for Types specification, and call necessary Stores
}
Framework.prototype.Workshop=async function(){}
// Validators are async and return the manipulated/passed value

Framework.Router=function(){
	this.Routes={};
}
Framework.Router.prototype.Assign=function(Identifier,Framework,Handler){
	this.Routes[Identifier]={Framework:Framework,Handler:Handler}; // Handler includes catching Framework errors if the instance doesn't do it itself
}

Framework.Admin={
	Inputs:['undefined','object','boolean','symbol','string','number','bigint','function'],
	Stats.Log:(Error)=>{console.Stats.Log(Error)},
	Reserved:['TYPE','META','WORK','ID','_id'],
	Error:function(Message,Stats,Quiet){
		let E={};
		E.name='BORG';
		E.message=(typeof Message=='string')?Message:Framework.Admin.Errors[91]();
		E.Stats.Log=(typeof Stats.Log=='string')?Stats.Log.filter(E=>E!=false):'';
		E.stack=Error.captureStackTrace(this,Framework.Admin.Error);
		// if Quiet, manually Stats.Log to console
		return E;
	},
	Errors:Framework.Language.Errors.en,
	Catch:function(){} // for catching custom errors and using their data
}
Framework.Documentation=function(File,API){}
Framework.Language={
	Default:false,
	Map:()=>{},
	
	
	
	Errors:{
		en:[
			()=>{return'The Name parameter given was not a string'},
			()=>{return'The API given was not an object'},
			()=>{return'The API given was not equipped with the Create method'},
			()=>{return'The Create property of API given was not a function'},
			()=>{return'The API given was not equipped with the Read method'},
			()=>{return'The Read property of API given was not a function'},
			()=>{return'The API given was not equipped with the Update method'},
			()=>{return'The Update property of API given was not a function'},
			()=>{return'The API given was not equipped with the Delete method'},
			()=>{return'The Delete property of API given was not a function'},
			()=>{return'The Stores object was missing'},
			()=>{return'The Stores property was not an object'},
			()=>{return'The Option parameter given was not a string'},
			()=>{return'The Option parameter was an empty string'},
			()=>{return'The Validator parameter given was not a function'},
			()=>{return'The Options object was missing'},
			()=>{return'The Options property was not an object'},
			()=>{return'The Options parameter given was not an array'},
			()=>{return`The Options parameter contained an invalid option (${(typeof a[i]==string&&!Array.isArray(a[i]))?a[i]:`index ${i}`})`},
			()=>{return'The Store parameter given was not a string'},
			()=>{return'The Store parameter was an empty string'},
			()=>{return`The Store parameter was invalid (${Store})`},
			()=>{return`The Key given was not a valid Option (${(typeof Key=='string'&&!Array.isArray(Key))?Key:'it was not a string'})`},
			()=>{return'The Required parameter given was not an array'},
			()=>{return'The Required parameter contained invalid entries'},
			()=>{return'The Options object was missing'},
			()=>{return'The Options property was not an object'},
			()=>{return'The Stores object was missing'},
			()=>{return'The Stores property was not an object'},
			()=>{return'The Types object was missing'},
			()=>{return'The Types property was not an object'},
			()=>{return'The Type parameter given was not a string'},
			()=>{return'The Type parameter was an empty string'},
			()=>{return`The Type parameter given was a reserved word (${Type})`},
			()=>{return'The Options parameter given was not an array'},
			()=>{return`The Options parameter contained an invalid option (${(typeof a[i]==string&&!Array.isArray(a[i]))?a[i]:`index ${i}`})`},
			()=>{return'The Store parameter given was not a string'},
			()=>{return'The Store parameter was an empty string'},
			()=>{return`The Store parameter was invalid (${Store})`},
			()=>{return'The Required parameter given was not an array'},
			()=>{return'The Required parameter contained invalid entries'},
			()=>{return'The Options object was missing'},
			()=>{return'The Options property was not an object'},
			()=>{return'The Stores object was missing'},
			()=>{return'The Stores property was not an object'},
			()=>{return'The Types object was missing'},
			()=>{return'The Types property was not an object'},
			()=>{return'The Format parameter given was not a string'},
			()=>{return'The Format parameter was an empty string'},
			()=>{return'The Function parameter given was not a function'},
			()=>{return'The Engines object was missing'},
			()=>{return'The Engines property was not an object'},
			()=>{return'The Stores object was missing'},
			()=>{return'The Stores property was not an object'},
			()=>{return`The Stores object has ${Object.keys(this.Stores).length} stores in it:`},
			()=>{return`Store: ${o[i]}`},
			()=>{return`The Stores ${o[i]} API was not equipped with the Create method`},
			()=>{return`The Create property of the Stores ${o[i]} API was not a function`},
			()=>{return`The Stores ${o[i]} API was not equipped with the Read method`},
			()=>{return`The Read property of the Stores ${o[i]} API was not a function`},
			()=>{return`The Stores ${o[i]} API was not equipped with the Update method`},
			()=>{return`The Update property of the Stores ${o[i]} API was not a function`},
			()=>{return`The Stores ${o[i]} API was not equipped with the Delete method`},
			()=>{return`The Delete property of the Stores ${o[i]} API was not a function`},
			()=>{return`The Stores ${o[i]} API was not an object`},
			()=>{return'The Options object was missing'},
			()=>{return'The Options property was not an object'},
			()=>{return`The Options object has ${Object.keys(this.Options).length} options in it:`},
			()=>{return`Option: ${o[i]}`},
			()=>{return`The Options[${(typeof o[i]!='string'||Array.isArray(o[i]))?o[i]:`Number ${i}`}] validator was not a function`},
			()=>{return'The Types object was missing'},
			()=>{return'The Types property was not an object'},
			()=>{return`The Types object has ${Object.keys(this.Types).length} types in it:`},
			()=>{return`Type: ${o[i]}`},
			()=>{return`The META Type Options are: [${this.Types['META'].Options.toString()}]`},
			()=>{return`The Types[${(o[i]!='string'||Array.isArray(o[i]))?o[i]:`Number ${i}`}] Options parameter was not an array`},
			()=>{return`The Types[${(o[i]!='string'||Array.isArray(o[i]))?o[i]:`Number ${i}`}] Options parameter contained an invalid option (${(typeof a[i]==string&&!Array.isArray(a[i]))?a[i]:`index ${i}`})`},
			()=>{return`The Types[${(typeof o[i]!='string'||Array.isArray(o[i]))?o[i]:`Number ${i}`}] Store parameter was not a string`},
			()=>{return`The Types[${(typeof this.Options[o[i]]!='string'||Array.isArray(Option))?o[i]:`number ${i}`}] Store parameter was invalid`},
			()=>{return'The Engines object was missing'},
			()=>{return'The Engines property was not an object'},
			()=>{return`The Engines object has ${Object.keys(this.Types).length} engines in it:`},
			()=>{return`Engine: ${o[i]}`},
			()=>{return`The ${(typeof o[i]==='string'&&!Array.isArray(o[i]))?o[i]:`Number ${i}`} Engine is not a function`},
			()=>{return'Store Addition Failed'},
			()=>{return'Option Addition Failed'},
			()=>{return'Type Addition Failed'},
			()=>{return'Type Addition Failed'},
			()=>{return'Engine Addition Failed'},
			()=>{return'Status Requested'},
			()=>{return'Undefined Error'},
		]
	}
	// ISO 639 Codes
	// Code to name and name to code
	// Built in langauge management tools
}
Framework.Mongo=async function(Options){}
Framework.Accounts=function(){}

// Add access Stats.Log option (Stats.Log .Process() operations with auth used)