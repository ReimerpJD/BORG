function Framework(Settings){
	this.Stores={};
	this.Inputs={};
	this.Types={};
	this.Engines={};
	this.Settings=Settings; // validate and scrub settings
}
Framework.prototype.Store=function(Name,API){
	this.Validate({Name:Name,API:API});
	this.Stores[Name]=API;
}
Framework.prototype.Input=function(Name,Function){
	this.Validate({Name:Name,Function:Function});
	this.Inputs[Name]=Function;
}
Framework.prototype.Type=function(Name,Options,Store,Required){
	this.Validate({Name:Name,Options:Options,Store:Store,Required:Required});
	this.Types[Name]={Store:this.Stores[Store],Options:this.Map(Options)};
}
Framework.prototype.Engine=function(Name,Function){
	this.Validate({Name:Name,Function:Function});
	this.Engines[Name]=Function;
}
Framework.prototype.Map=function(Options){
	let Shell={};
	for(let i=0,o=Object.keys(this.Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	return Shell;
}
Framework.prototype.Create=function(Data,Auth){
	
}
Framework.prototype.Read=function(ID,Filters,Auth){
	
}
Framework.prototype.Update=function(ID,Data,Auth){
	
}
Framework.prototype.Delete=function(ID,Recursive,Auth){
	
}
Framework.prototype.Validate=function(Location,Values,Silencer){
	let Log=[this.Error(Location)];
	if(typeof Values!='object'||Values===null)Log.push(this.Error('NOVALS'));
	else{
		for(let i=0,o=Object.keys(Values),l=o.length;i<l;i++){
			if(!(o[i] in this.Validators))Log.push(this.Error('NOVALIDATOR'));
			else if(!this.Validators[o[i]](Values[o[i]],Values))Log.push(this.Error(o[i]));
		}
	}
	if(Log.length>1)throw new Error(Log.join('\n'));
}
Framework.prototype.Validators={ // return true or false
	Name:function(Value,Values){},
	API:function(Value,Values){},
	Function:function(Value,Values){},
	Options:function(Value,Values){},
	Store:function(Value,Values){},
	Required:function(Value,Values){}
}
Framework.prototype.Error=function(Location){
	if(Location in this.Errors)return this.Errors[Location]+'\n';
	else if('UNDEFINED' in this.Errors)return this.Errors['UNDEFINED']+'\n';
	else return 'An unexpected error occurred\n';
}
Framework.prototype.Errors={
	UNDEFINED:'An unexpected error occurred',
	NOVALS:'No values were provided to the Validator',
	NOVALIDATOR:'There was no validator registered to validate the value given',
}
Framework.Router=function(){
	
}
Framework.Router.prototype.Assign=function(Name,Handler,Framework){
	
}
Framework.Router.prototype.Process=function(Name,Inputs){
	
}
Framework.Documentation=function(File){} // finish