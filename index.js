// Each function has error handling and logging into Information
// Runtime errors (not instanciation) should be logged elsewhere (console, ...)
function Framework(Data){
	this.Data=Data;
	this.Queries={};
	this.Metadata={};// Stores Metadata types and validators
	this.Types={};// Stores Data types and validators
	this.Engines={};
	this.Workbenches={};// Stores work-in progress resources
	this.Information={}// Error logs and runtime information
	this.Query=function(Operation,Options,Handler){}// Define a valid query and how it is responded to
	this.Meta=function(Identifier,Validator){}// Define a meta property structure by its Identifier and Validation function
	this.Data=function(Identifier,Validator){// Define a data structure by its Type Identifier and Validation function
		// How will inputs be defined?
		// Validate identifier as a valid JavaScript identifier
		// validate validator as a function that uses all inputs
	}
	this.Engine=function(Format,Function){this.Engines[Format]=Function}// Define an output format and an engine for it
	this.Process=async function(Request){}// Takes {?}
	this.Workshop=function(ID,Operation,Data){}// For building new resources one line at a time
}
Framework.Data=function(){
	this.Queries={};
	this.Information={}// Error logs and runtime information
	this.Query=function(Operation,Options,Handler){}// Define a valid query and how it is responded to
}
Framework.Router=function(){
	this.Modules={};
	this.Information={}// Error logs and runtime information
	this.Assign=function(Identifier,Framework,Handler){}// Assign a framework instance to respond to a particular call string, Handler builds {?}
}
Framework.Admin=function(){}// Built in framework manager/statistical analyis/exception handling
Framework.Mongo=function(Options){}// Built in MongoDB Data instance creator (execute this.Metadata[Identifier]=Validator;to return instance)
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