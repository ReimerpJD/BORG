function Framework(Data){
	this.Data=Data;
	this.Queries={};
	this.Types={};
	this.Engines={};
	this.Workbenches={};
	this.Information={}//Error logs and runtime information
	this.Process=async function(Request){}//Takes {?}
	this.Query=function(Operation,Options,Handler){}//Define a valid query and how it is responded to
	this.Data=function(Identifier,Validator){}//Define a data structure by its Type Identifier and Validation function
	this.Engine=function(Format,Function){}//Define an output format and an engine for it
	this.Workshop=function(){}//For building new resources one line at a time
}
Framework.Data=function(){
	this.Queries={};
	this.Information={}//Error logs and runtime information
	this.Query=function(Operation,Options,Handler){}//Define a valid query and how it is responded to
}
Framework.Router=function(){
	this.Information={}//Error logs and runtime information
	this.Modules={};
	this.Assign=function(Identifier,Framework,Handler){}//Assign a framework instance to respond to a particular call string, Handler builds {?}
}
Framework.Admin=function(){}//Built in framework manager/statistical analyis/exception handling
Framework.Mongo=function(Options){}//Built in MongoDB Data instance creator (execute to return instance)
Framework.Accounts={
	//Built in acccount pool management tools/classes
}
Framework.Documentation=function(File,API){
	//Built in documentation rendering {$}
}
Framework.Language={
	Default:false,
	Map:()=>{},
	//ISO 639 Codes
	//Code to name and name to code
	//Built in langauge management tools
}