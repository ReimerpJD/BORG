function Framework(Data){
	this.Meta={};
	this.Data={};
	this.Engines={};
	this.Workbenches={};
}
Framework.prototype.MetaType=function(Type,Validator){
	this.Meta[Type]=Validator;
}
Framework.prototype.DataType=function(Type,Validator){
	this.Data[Type]=Validator;
}
Framework.prototype.Engine=function(Engine,Function){
	this.Engines[Engine]=Function;
}
Framework.prototype.Process=async function(Request){
	let Shell=await this.Queries[Request.Operation](Request,{});
	return await this.Validate(Shell);
}
Framework.prototype.Validate=function(Response){}
Framework.prototype.Workshop=function(){}

/*
Framework.Data=function(){
	this.Tools={};
	this.Queries={};
}
Framework.Data.prototype.Query=function(Query,Options){
	return this.Queries[Query](this.Tools,Options);
}
Framework.Data.prototype.Define=function(Query,Handler){
	this.Queries[Query]=Handler;
}
Framework.Data.prototype.Equip=function(Name,Tool){
	this.Tools[Name]=Tool;
}*/
// Define Filters/Options and use
// Impliment EH
// Force Default CRUD API
// (Validating options is done by handlers individually)

Framework.Router=function(){}
Framework.Router.prototype.Assign=function(Identifier,Framework,Handler){}

Framework.Admin={
	Inputs:['undefined','object','boolean','symbol','string','number','bigint','function'],
	Log:(Error)=>{console.log(Error)},
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

// Add error handling mechanisms