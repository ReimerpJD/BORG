function Framework(IDGEN){
	this.ID=IDGEN;
	this.Stores={};
	this.Inputs={};
	this.Types={};
	this.Engines={};
}
Framework.prototype.Store=function(Name,API){
	this.Stores[Name]=API;
}
Framework.prototype.Input=function(Name,Function){
	this.Inputs[Name]=Function;
}
Framework.prototype.Meta=function(Options,Store,Required){
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	Shell.REQUIRED=[];
	for(let i=0,l=Required.length;i<l;i++)Shell.REQUIRED.push(Shell[Required[i]]);
	Shell.STORE=Store;
	this.Meta=Shell;
}
Framework.prototype.Type=function(Name,Options,Store,Required){
	let Shell={};
	for(let i=0,o=Object.keys(Options),l=o.length;i<l;i++)Shell[o[i]]=this.Inputs[Options[o[i]]];
	Shell.REQUIRED=[];
	for(let i=0,l=Required.length;i<l;i++)Shell.REQUIRED.push(Shell[Required[i]]);
	Shell.STORE=Store;
	this.Types[Name]=Shell;
}
Framework.prototype.Engine=function(Name,Function){
	this.Engines[Name]=Function;
}
Framework.prototype.Search=async function(Filters){
	// return array of matching Metas
	return await this.Meta.Store.Read(Filters);
}
Framework.prototype.Create=async function(Meta){
	let ID=await this.ID();
	return await this.Meta.Store.Create(ID,Meta)
	// validate REQUIRED
	// return RID
}
Framework.prototype.Read=async function(RID,Filters,Engine){
	let M=await this.Meta.Store.Read({ID:RID});
	let Data=[];
	// find Data based on filters
	M.DATA=Data;
	return await Engine?this.Engines[Engine](M):M;
}
Framework.prototype.Update=async function(RID,UID,Data){
	// return true/false for success
	// to update META, UID = -1
}
Framework.prototype.Delete=async function(RID){
	// return true/false for success
}
Framework.Router=function(){
	
}
Framework.Router.prototype.Assign=function(Name,Handler,Framework){
	
}
Framework.Router.prototype.Process=function(Name,Inputs){
	
}
Framework.Documentation=function(File){} // finish

// how are Meta/RID and UID managed?