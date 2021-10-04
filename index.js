// NEED CUSTOM ERROR CLASS TO FIX ERROR HANDLING

// Each function has Error Handling
// Runtime errors (not instanciation) should be logged elsewhere (console, ...)
function Framework(Data){
	
	// Add validation and error handling on incoming Data object
	// Data object is REQUIRED, fail/error out without it
	// Check for use of all present Data methods? or the default CRUD
	if(!Data)throw new Error('Framework Instanciation Failed Because Data Instance Was Not Provided');
	// CHECK FOR DATA API HERE
	this.Data=Data;
	
	// Define composition (identifiers, validators, ...)
	this.Queries={};
	this.Metadata={};
	this.Types={};
	this.Engines={};
	
	// ???
	this.Workbenches={};// Stores work-in progress resources
	
	// EH inputs
	// How will options work? EH for unused options?
	this.Query=function(Operation,Options,Handler){}// Define a valid query and how it is responded to
	
	// EH and validation
	this.Meta=function(Identifier,Validator){}// Define a meta property structure by its Identifier and Validation function
	this.Data=function(Identifier,Validator){// Define a data structure by its Type Identifier and Validation function
		// How will inputs be defined?
		// Validate identifier as a valid JavaScript identifier
		// validate validator as a function that uses all inputs
	}
	
	// Make framework for defining engines? Guide??
	this.Engine=function(Format,Function){this.Engines[Format]=Function}// Define an output format and an engine for it
	this.Process=async function(Request){}// Takes {?}
	this.Workshop=function(ID,Operation,Data){}// For building new resources one line at a time
	this.Finalize=function(){}// Checks for missing pieces before instance is ready to be used
}
Framework.Data=function(Options){
	if(Options.CustomAPI)this.CustomAPI=true;
	this.Finalized=false;
	this.Queries={};
	this.Toolbox={};
	this.Query=async function(Operation,Options){
		if(!this.Queries[Operation])throw new Error(`Invalid Query: ${Operation}`);
		if(Options)for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(typeof Options[o[i]]!=this.Queries[Operation][o[i]])throw new Error(`Invalid Option Encountered: Query ${Operation}, Option ${o[i]}`);
		return await this.Queries[Operation].Handler(Options);
	};
	this.AddQuery=function(Operation,Options,Handler){
		if(this.Finalized)throw new Error('Refused Query Addition Attempt After Finalization');
		if(typeof Operation!='string'||typeof Options!='object'||typeof Handler !='function')throw new Error(`Invalid Query Definition:${typeof Operation!='string'?' The operation identifier given is not a string.':''}${typeof Options!='object'?' The Options property given is not an object.':''}${typeof Handler !='function'?' The Handler given is not a function.':''}`);
		this.Queries[Operation]={Inputs:{},Handler:Handler};
		for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)if(Framework.Admin.Inputs.includes(Options[o[i]]))this.Queries[Operation].Inputs[o[i]]=Options[o[i]];
	}
	this.AddTool=function(Name,Tool){
		if(!Name||typeof Name!='string'||!Tool)throw new Error('Tool Addition Failed');
		this.Toolbox[Name]=Tool;
	}
	this.Finalize=function(){
		if(!this.CustomAPI&&(!this.Queries.Create||!this.Queries.Read||!this.Queries.Update||!this.Queries.Delete))throw new Error(`Missing Default Queries:${this.Queries.Create?'':' Create'}${this.Queries.Read?'':' Read'}${this.Queries.Update?'':' Update'}${this.Queries.Delete?'':' Delete'}`);
		if(Object.keys(this.Queries).length==0)throw new Error('The Data instance could not be finalized because it has no valid queries');
		this.Finalized=true;
	}
}
Framework.Router=function(){
	this.Modules={};
	this.Assign=function(Identifier,Framework,Handler){}// Assign a framework instance to respond to a particular call string, Handler builds {?}
	this.Finalize=function(){}// Checks for missing pieces before router is ready to be used
}
// Built in framework manager/statistical analyis/exception handling
Framework.Admin={
	Inputs:['undefined','object','boolean','symbol','string','number','bigint','function'];
}
// Built in MongoDB Data instance creator (execute this.Metadata[Identifier]=Validator; to return instance)
Framework.Mongo=function(Options){

}
Framework.Accounts={
	// Built in account pool management tools/classes
}
Framework.Documentation=function(File,API){
	// Built in documentation rendering {$}
}
Framework.Language={
	Default:false,
	Map:()=>{},
	// ISO 639 Codes
	// Code to name and name to code
	// Built in langauge management tools
}