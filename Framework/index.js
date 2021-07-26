const Path=require('path');
const FS=require('fs');
const Account=require(Path.join(__dirname,'Framework','Account'));
const Admin=require(Path.join(__dirname,'Framework','Admin'));
const Boot=require(Path.join(__dirname,'Framework','Boot'));
const Resource=require(Path.join(__dirname,'Framework','Resource'));
const Database=require(Path.join(__dirname,'Framework','Database'));
var API=async(Request)=>{
	let Shell={};
	Shell.Account=await Account.Authorize(Request.Authorization).catch(()=>{return false}).then(P=>{return await Account.Meta(P?Request.Authorization.Account:'1')});
	Shell.Date=Math.floor(Date.now()/1000);
	Shell.Language=Request.Language?Request.Language:process.env.DEFAULT_LANGUAGE;
	Shell.Data=[];
	let Error=await Database('Errors',{Code:12}).then(E=>E[0]);
	let Response=await Database('Messages',{Code:Number.isInteger(Error.Message)?Error.Message:1}).then(E=>E[0]);
	if(!Response)Response={la:'Defectum Ad Partum :/'};
	let Language=Account.Language(Request.Language,Shell.Account.Languages,Object.keys(Response));
	let Message=Response[Language];
	var Invalid={Error:Message};
	if(Request.Instructions)for(let i=0,l=Request.Instructions.length;i<l;i++){
		if(API[Request.Instructions[i].Subsystem]&&typeof API[Request.Instructions[i].Subsystem][Request.Instructions[i].Function]=='function')var R=await API[Request.Instructions[i].Subsystem][Request.Instructions[i].Function](Request.Instructions[i].Options,Shell.Account,Shell.Language).catch(E=>API.Admin(E,Options,Account,Language));
		Shell.Data.push(R?R:Invalid);
	}
	return Shell;
};
API.Account={};
API.Account.Login=async(Options)=>{
	if(typeof Options!='object'||typeof Options.Tag!='string'||typeof Options.Password!='string')throw 12;
	let Shell={};
	Shell.Result=await Account(Options.Tag,Options.Password,Options.NoKey);
	return Shell;
}
API.Account.Logout=async(Options,A)=>{
	if(A.ID=='1')throw 12;
	let Shell={};
	Shell.Result=await Account.Logout(A.ID);
	return Shell;
}
API.Account.Challenge=async(Options,A,Language)=>{
	if(A.ID=='1')throw 12;
	let Shell={};
	Shell.Result=await Account.Challenge(A.ID);
	return Shell;
}
API.Account.Create=async(Options,A)=>{
	//MISSING ADMIN KEY TO ALLOW ACTION
	if(typeof Options!='object'||typeof Options.Tag!='string'||typeof Options.Name!='object'||typeof Options.Password!='string'||typeof Options.Languages!='array')throw 12;
	let Shell={};
	//let V=await Admin.Key(false,Options.Key);
	Shell.Result=await Account.Create(Options,A.ID=='0');
	return Shell;
}
API.Account.Update=async(Options,A)=>{
	if(typeof Options!='object'||A.ID=='1')throw 12;
	let Shell={};
	Shell.Result=await Account.Update(Options,A.ID=='0');
	return Shell;
}
API.Account.Delete=async(Options,A)=>{
	if(typeof Options!='object'||A.ID=='1')throw 12;
	let Shell={};
	Shell.Result=await Account.Delete(A.ID);
	return Shell;
}
API.Account.Validate=async(Options,A)=>{
	if(typeof Options!='object'||A.ID=='1')throw 12;
	let Shell={};
	Shell.Result=await Account.Validate(Options);
	return Shell;
}
API.Admin=async(Error,Options,A,Language)=>{
	let Shell={};
	Admin.Log(Error);
	Shell.Error=await Admin(Error,A,Language);
	return Shell;
};
API.Admin.Documentation=async(Options,A)=>{
	if(typeof Options!='object'||A.ID!='0'||typeof Options.File!='string')throw 12;
	let Shell={};
	Shell.Meta={Owner:'0',Title:'Live Documentation',Languages:['en'],Access:{Blacklist:[],Know:[],View:['0'],Edit:[]},Engine:'Documentation'};
	Shell.Data=await Resource.Documentation(Path.join(__dirname,Options.File),true);
	return Shell;
}
/*API.Admin.Flush=async(Options,A)=>{
	if(typeof Options!='object'||A.ID!='0')throw 12;
	let Shell={};
	//let Result=await Initialize({Flush:true});???????
	return Shell;
	return Shell;
}
API.Admin.NewPassword=async(Options,A)=>{
	if(A.ID!='0')throw 12;
	let Shell={};
	//let Result=await Admin.NewPassword();???
	return Shell;
}
API.Admin.UpdatePassword=async(Options,A)=>{
	if(typeof Options.Key!='string'||typeof Options.Password!='string')throw 12;
	let Shell={Result:false};
	let V=await Admin.Key(true,Options.Key);
	//if(V){Shell.Result=await Account.Update({Password:Options.Password})}???
	return Shell;
}
API.Admin.NewAccount=async(Options,A)=>{
	if(A.ID!='0')throw 12;
	let Shell={};
	//let Result=await Admin.ResetPassword();???
	return Shell;
}
API.Admin.LockA=async(Options,A)=>{
	if(typeof Options!='object'||A.ID!='0')throw 12;
	let Shell={};
	//let Result=await Admin.Lock(false,Options.Account);???
	return Shell;
}
API.Admin.LockR=async(Options,A)=>{
	if(typeof Options!='object'||A.ID!='0')throw 12;
	let Shell={};
	//let Result=await await Admin.Lock(false,Options.Resource);???
	return Shell;
}*/
API.Resource={};
API.Resource.Render=async(Options,A,Language)=>{
	if(typeof Options!='object'||typeof Options.ID!='string')throw 12;
	let Shell=await Resource(Options.ID,Language,A);
	return Shell;
}
API.Resource.Meta=async(Options,A)=>{
	if(typeof Options!='object'||typeof Options.IDs!='array')throw 12;
	let Shell={};
	Shell.Result=await Resource.Metas(Options.IDs,A);
	return Shell;
}
API.Resource.Documentation=async(Options,A)=>{
	if(typeof Options!='object'||typeof Options.File!='string')throw 12;
	let Shell={};
	Shell.Meta={Owner:'0',Title:'API Documentation',Languages:['en'],Access:{Blacklist:[],Know:[],View:['1'],Edit:[]},Engine:'Documentation'};
	let File=Options.File.replace(/[/\\?%*:|"<>]/g,'');
	Shell.Data=await Resource.Documentation(Path.join(__dirname,'..','Routers',File),A.ID=='0');
	return Shell;
}
API.Resource.Create=async(Options,A)=>{
	if(typeof Options!='object'||typeof Options.Meta!='object'||typeof Options.Data!='array')throw 12;
	if(!Account.Creator(A))throw 17;
	let Shell={};
	Shell.Result=await Resource.Create(Options,A);
	return Shell;
}
API.Resource.Update=async(Options,A)=>{
	if(typeof Options!='object'||typeof Options.ID!='string'||typeof Options.Updates!='object')throw 12;
	let Shell={};
	Shell.Result=await Resource.Update(Options.ID,Options.Updates,A);
	return Shell;
}
API.Resource.Delete=async(Options,A)=>{
	if(typeof Options!='object'||typeof Options.ID!='string')throw 12;
	let Shell={};
	Shell.Body=await Resource.Delete(Options.ID,A);
	return Shell;
}
API.Resource.File=async(Options,A)=>{
	if(typeof Options!='object'||typeof Options.File!='string')throw 12;
	let Shell={};
	let File=Options.File.replace(/[/\\?%*:|"<>]/g,'');
	let ID=File.split('.')[0];
	let M=await Database('Meta',{ID:ID});
	if(M)var Access=Account.Access(A,M);
	if(M&&Access.View)var File=FS.readFileSync(Path.join(__dirname,'..','Files',File));
	Shell.Result=File;
	return Shell;
}
API.Resource.Log=async(Options,A)=>{
	if(typeof Options!='object'||typeof Options.ID!='string'||typeof Options.Log!='string'||typeof Options.Data!='object')throw 12;
	let Shell={};
	Shell.Result=await Resource.Log(Options.ID,A,Options.Log,Options.Data);
	return Shell;
}
API.Mods=require(Path.join(__dirname,'Framework','Mods'));
module.exports=API;