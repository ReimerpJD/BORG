function Framework(Database,Engine){
	this.Process=async function(Request){}
}


Framework.Database=function(){
	this.Insert=async function(Options){}
	this.Query=async function(Options){}
	this.Modify=async function(Options){}
	this.Delete=async function(Options){}
	//deal with multiple db types?
	//check connection?
}
Framework.Engine=function(Types){
	this.Types=Types;
	this.Errors={};
	this.Add=function(Type,Format,Function){}
	this.Output=function(Format,Function){}
	this.Render=function(Resource,Format,Options){}
	//Types input format: {Type:{'Inputs':[]}}?
}
Framework.Router=function(){//constructions and use unclear
	
}


Framework.Accounts=function(){}
Framework.Admin=function(){
	//functions automatically called by instances to fix db issues, ...
	//all static methods for if instance fails?
}


Framework.Documentation=function(){}//understand uses
Framework.Language=function(){}//understand uses
Framework.Inputs={}//Needs reevaluation