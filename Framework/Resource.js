//#Framework Resurce Module
//!Imports
const Path=require('path');
const FS=require('fs');
const Account=require(Path.join(__dirname,'Account'));
const Database=require(Path.join(__dirname,'Database'));
//!Resource
//=Renders the resource using the data given
//:ID (string) the resouce id
//:Language (string) the iso 639-1 language code of the requested language
//:A (object) the requesting account object
//$Resource Object
async function Resource(ID,Language,A){
	let Shell={};
	Shell.Meta=await Database('Meta',{ID:ID.toString()}).then(E=>{if(E[0]){return E[0]}else{throw 16}});
	let Access=Account.Access(A,Shell.Meta.Access);
	if(!Access.Know)throw 41;
	Shell.Meta.Language=Account.Language(Language,A.Languages,Shell.Meta.Languages);
	if(Access.View&&Shell.Meta.Body){
		for(let i=0;i<Shell.Meta.Body.length;i++){
			if(Shell.Meta.Body[i].Type=='Data'){
				let P=[i,1];
				let Data=await Database('Data',{ID:ID.toString()});
				P.concat(Data);
				Array.prototype.splice.apply(Shell.Meta.Body,P);
			}else if(Shell.Meta.Body[i].Type=='Log'){
				if(Shell.Meta.Body[i].Data.Key)var Log=await Database('Log',{ID:ID.toString(),Key:Shell.Meta.Body[i].Data.Key});
				if(Log)Shell.Meta.Body[i].Data.Log=Log;
			}
		}
		for(let i=0;i<Shell.Meta.Body.length;i++)if(Shell.Meta.Body[i].Languages&&Shell.Meta.Body[i].Languages.length>0&&Shell.Meta.Body[i].Data)Shell.Meta.Body[i].Data=Object.assign(Shell.Meta.Body[i].Data,Shell.Meta.Body[i][Account.Language(Shell.Meta.Language,A.Languages,Shell.Meta.Body[i].Languages)]);
		Shell.Body=Shell.Meta.Body;
	}
	Shell.Meta=Resource.Censor(Shell.Meta);
	return Shell;
}
//!Resource Meta
//=Returns censored meta objects for each ID in the array
//:IDs (array) array of resource IDs (strings)
Resource.Metas=async(IDs,A)=>{
	let Shell=[];
	for(let i=0;i<IDs.length;i++){
		let Meta=await Database('Meta',{ID:IDs[i].toString()}).then(E=>{if(E[0])return E[0]}).catch(()=>{return false});
		if(Meta)var M=await Account.Access(A,Meta.Access).catch(()=>{return false});
		if(M&&M.View)Shell.push(Resource.Censor(Meta));
	}
	return Shell;
}
//!Resource Censor
//=Takes a raw meta object and strips it of its _id, Access, and Body properties
Resource.Censor=Meta=>{
	if(Meta['_id'])delete Meta['_id'];
	if(Meta.Access)delete Meta.Access;
	if(Meta.Body)delete Meta.Body;
	return Meta;
}
//!Resource Delete
//=If the Account has Ownership of the Resource, the Resource, its files, data, and logs are deleted
//:ID (string) the ID of the Resource to be deleted
//:AID (string) the Account ID of the Account that made the request
Resource.Delete=async(ID,AID)=>{
	if(A.ID=='1')throw 11;
	let Meta=await Database('Meta',{ID:ID}).then(E=>{if(E[0]){return E[0]}else{throw 16}});
	let Owner=A.ID==Meta.Owner;
	if(!Owner)throw 11;
	await Database.Erase('Meta',{ID:ID});
	await Database.Erase('Data',{ID:ID});
	await Database.Erase('Log',{ID:ID});
	return true;
}
//!Resource Documentation
//=Renders the given document into documentation in the JSON format
//:File (string) the full filepath of the document to render
//:Admin (binary) specifies whether or not to render full code documentation
//$Documentation Object
//&Document Missing: Error 7
//-The API documentation is rendered using the engine, with the Admin parameter set to false
Resource.Documentation=(File,Admin)=>{
	var jsonize=()=>{
		let Map=[{File:Path.basename(File)+' Documentation'}];
		Map[1]={};
		let inside=false;
		let skip=false;
		Data.forEach((Element,Index)=>{
			switch(Element.substring(0,3)){
			case'//#':if(Admin){Map.push({Header:Element.substring(3)})}else{skip=true};break;
			case'//!':if(Admin){Map.push({Title:Element.substring(3)})}else{skip=true};break;
			case'//?':inside=true;Map.push({Title:Element.substring(3)});skip=false;break;
			case'//=':if(!skip){Map[Map.length-1].Link=Element.substring(3)}break;
			case'//=':if(!skip){if(!Map[Map.length-1].Description){Map[Map.length-1].Description=[]}Map[Map.length-1].Description.push(Element.substring(3))}break;
			case'//:':if(!skip){if(!Map[Map.length-1].Parameters){Map[Map.length-1].Parameters=[]}Map[Map.length-1].Parameters.push(Element.substring(3))}break;
			case'//$':if(!skip){if(!Map[Map.length-1].Returns){Map[Map.length-1].Returns=[]}Map[Map.length-1].Returns.push(Element.substring(3))}break;
			case'//&':if(!skip){if(!Map[Map.length-1].Failures){Map[Map.length-1].Failures=[]}Map[Map.length-1].Failures.push(Element.substring(3))}break;
			case'//-':if(!skip){if(!Map[Map.length-1].Comments){Map[Map.length-1].Comments=[]}Map[Map.length-1].Comments.push(Element.substring(3))}break;
			default:if(Admin)Map[Map.length-1]['Line '+(Index+1)]=Element;
			}
		});
		return Map;
	}
	let Data=[];
	if(!FS.existsSync(File))throw 7;
	let Lines=FS.readFileSync(File,'utf-8').split('\n');
	for(let i=0;i<Lines.length;i++)if(Lines[i]!='')Data.push(Lines[i].trim());
	return jsonize();
}
//!Resource Create
//=Creates a new resource using the data and account given
//:Resource (object) contains the Meta object and Data array to be uploaded to the database
//:A (object) the Account object of the creating account
Resource.Create=async(Resource,A)=>{
	if(A.ID=='1')throw 11;
	let Shell={};
	let Shell.ID=await Database.ID('Resource');
	Shell.Owner=A.ID;
	if(typeof Resource.Meta.Background=='object'&&typeof Resource.Meta.Background.Type=='string'&&typeof Resource.Meta.Value=='string')Shell.Background={Type:Resource.Meta.Background.Type,Value:Resource.Meta.Background.Value};
	if(typeof Resource.Meta.Main=='string'&&Resource.Meta.Main.length>15)Shell.Main=Resource.Meta.Main;
	if(typeof Resource.Meta.Text=='string'&&Resource.Meta.Text.length>15)Shell.Text=Resource.Meta.Text;
	if(Resource.Meta.Title){
		if(typeof Resource.Meta.Title!='object')Resource.Meta.Title={};
		let Languages=Object.keys(Resource.Meta.Title);
		let Linguae=await Database.Keys('Lingua:*');
		let LV=Languages.every(L=>Linguae.includes(L));
		let NV=Languages.every(L=>{return (typeof Resource.Meta.Title[L]=='string'&&Resource.Meta.Title[L].length>100)});
		Shell.Title=(LV&&NV)?Resource.Meta.Title:false;
	}else{Shell.Title={}}
	if(Resource.Meta.Languages){
		if(typeof Resource.Meta.Languages!='array')Resource.Meta.Languages=[];
		let Linguae=await Database.Keys('Lingua:*');
		let LV=Resource.Meta.Languages.filter(L=>Linguae.includes(L));
		Shell.Languages=LV?LV:[];
	}else{Shell.Languages=[]}
	if(Resource.Meta.Access){
		if(typeof Resource.Meta.Access!='object')Resource.Meta.Access={Blacklist:['1'],Know:[],View:[],Edit:[Shell.Owner]};
		Shell.Access={Blackist:[],Know:[],View:[],Edit:[]};
		let Permissions=Object.keys(Shell.Access);
		for(let p=0;p<Permissions.length;p++)if(typeof Resource.Meta.Access[Permissions[p]]=='array')for(let i=0;i<Resource.Meta.Access[Permissions[p]].length;i++){
			let Exists=await Account.Meta(Resource.Meta.Access[Permissions[p]][i]);
			if(Exists)Shell.Access[Permissions[p]].push(Resource.Meta.Access[Permissions[p]][i]);
		}
	}else{Shell.Access={Blacklist:['1'],Know:[],View:[],Edit:[Shell.Owner]}}
	if(Resource.Meta.Log){
		if(typeof Resource.Meta.Log!='object')Resource.Meta.Log={};
		let Log={};
		let Logs=Object.keys(Resource.Meta.Log);
		for(let i=0;i<Logs.length;i++)Log[Logs[i]]=[];
		let Permissions=Object.keys(Log);
		for(let p=0;p<Permissions.length;p++)if(typeof Resource.Meta.Log[Permissions[p]]=='array')for(let i=0;i<Resource.Meta.Log[Permissions[p]].length;i++){
			let Exists=await Account.Meta(Resource.Meta.Log[Permissions[p]][i]);
			if(Exists)Log[Permissions[p]].push(Resource.Meta.Log[Permissions[p]][i]);
		}
		for(let i=0;i<Logs.length;i++)Shell.Access['Log_'+Logs[i]]=Log[Logs[i]];
	}
	if(Resource.Meta.Tags){
		if(typeof Resource.Meta.Tags!='array')Resource.Meta.Tags=[];
		let P=Resource.Meta.Tags.filter(E=>(typeof E=='string'&&E.length<100));
		Shell.Tags=P;
	}
	if(Resource.Data&&typeof Resource.Data=='array')Shell.Body=[{Type='Data'}];
	let T=Math.floor(Date.now()/1000);
	Shell.Expired=Resource.Meta.Expired?true:false;
	Shell.Record=[T];
	Shell.Locked=false;
	if(Resource.Meta.Engine)Shell.Engine=Resource.Meta.Engine;
	if(Shell.Engine){
		var Validator=false;
		try{var Validator=require(Path.join(__dirname,'..','Engines',Shell.Engine,'Validate'))}catch(E){return false}
	}
	let Data=false;
	let i=0;
	if(Validator&&typeof Resource.Data=='array'){Data=Resource.Data.filter(Validator).map(D=>D.UID=i++)}
	else if(!Shell.Engine){Data=Resource.Data.filter(require(Path.join(__dirname,'Engine')).Validator).map(D=>{D.UID=i++;D.ID=Shell.ID})}
	await Database.Insert('Meta',Shell.Meta);
	if(Data)for(let i=0;i<Data.length){
		await Database.Insert('Data',Data[i]);
		if(Data[i].File=true)FS.writeFileSync(Path.join(__dirname,'Files',Shell.ID+'.'+Data[i].UID+'.'+T),Resource.Files[Data[i].Data.Name]);
	}
	return true;
}
//!Resource Update
//=Creates a new resource using the data and account given
//:Updates (object) contains the Meta object and Data array to pull updates from
//:A (object) the Account object of the requesting account

//Transfer Ownership
//Manage Authors? NO!, only Access arrays

Resource.Update=async(ID,Updates,A)=>{
	if(A.ID=='1')throw 11;
	let Meta=await Database('Meta',{ID:ID}).then(E=>{if(E[0]){return E[0]}else{throw 16}});
	let Owner=A.ID==Meta.Owner;
	let Access=Account.Access(A,Meta.Access);
	if(!Owner&&!Access.Edit)throw 11;
	let Shell={};
	if(Owner&&typeof Updates.Meta.Owner=='string'){
		let Exists=await Account.Meta(Updates.Meta.Access[Permissions[p]][i]);
		if(Exists)Shell.Owner=Updates.Meta.Owner;
	}
	if(typeof Updates.Meta.Background=='object'&&typeof Updates.Meta.Background.Type=='string'&&typeof Updates.Meta.Value=='string')Shell.Background={Type:Updates.Meta.Background.Type,Value:Updates.Meta.Background.Value};
	if(typeof Updates.Meta.Main=='string'&&Updates.Meta.Main.length>15)Shell.Main=Updates.Meta.Main;
	if(typeof Updates.Meta.Text=='string'&&Updates.Meta.Text.length>15)Shell.Text=Updates.Meta.Text;
	if(Updates.Meta.Title){
		if(typeof Updates.Meta.Title!='object')Updates.Meta.Title={};
		let Languages=Object.keys(Updates.Meta.Title);
		let Linguae=await Database.Keys('Lingua:*');
		let LV=Languages.every(L=>Linguae.includes(L));
		let NV=Languages.every(L=>{return (typeof Updates.Meta.Title[L]=='string'&&Updates.Meta.Title[L].length>100)});
		Shell.Title=(LV&&NV)?Updates.Meta.Title:false;
	}
	if(Updates.Meta.Languages){
		if(typeof Updates.Meta.Languages!='array')Updates.Meta.Languages=[];
		let Linguae=await Database.Keys('Lingua:*');
		let LV=Updates.Meta.Languages.filter(L=>Linguae.includes(L));
		Shell.Languages=LV?LV:[];
	}
	if(Updates.Meta.Access){
		if(typeof Updates.Meta.Access!='object')Updates.Meta.Access={Blacklist:['1'],Know:[],View:[],Edit:[Shell.Owner]};
		Shell.Access={Blackist:[],Know:[],View:[],Edit:[]};
		let Permissions=Object.keys(Shell.Access);
		for(let p=0;p<Permissions.length;p++)if(typeof Updates.Meta.Access[Permissions[p]]=='array')for(let i=0;i<Updates.Meta.Access[Permissions[p]].length;i++){
			let Exists=await Account.Meta(Updates.Meta.Access[Permissions[p]][i]);
			if(Exists)Shell.Access[Permissions[p]].push(Updates.Meta.Access[Permissions[p]][i]);
		}
	}
	if(Updates.Meta.Log){
		if(typeof Updates.Meta.Log!='object')Updates.Meta.Log={};
		let Log={};
		let Logs=Object.keys(Updates.Meta.Log);
		for(let i=0;i<Logs.length;i++)Log[Logs[i]]=[];
		let Permissions=Object.keys(Log);
		for(let p=0;p<Permissions.length;p++)if(typeof Updates.Meta.Log[Permissions[p]]=='array')for(let i=0;i<Updates.Meta.Log[Permissions[p]].length;i++){
			let Exists=await Account.Meta(Updates.Meta.Log[Permissions[p]][i]);
			if(Exists)Log[Permissions[p]].push(Updates.Meta.Log[Permissions[p]][i]);
		}
		for(let i=0;i<Logs.length;i++)Shell.Access['Log_'+Logs[i]]=Log[Logs[i]];
	}
	if(Updates.Meta.Tags){
		if(typeof Updates.Meta.Tags!='array')Updates.Meta.Tags=[];
		let P=Updates.Meta.Tags.filter(E=>(typeof E=='string'&&E.length<100));
		Shell.Tags=P;
	}
	let T=Math.floor(Date.now()/1000);
	Shell.Record=Meta.Record;
	Shell.Record.push(T);
	Shell.Expired=Updates.Meta.Expired?true:false;
	if(Owner)Shell.Locked=Updates.Meta.Expired?true:false;
	if(Shell.Engine){
		var Validator=false;
		try{var Validator=require(Path.join(__dirname,'..','Engines',Shell.Engine,'Validate'))}catch(E){return false}
	}
	await Database.Update('Meta',{ID:ID},Shell.Meta);
	if(Meta.Data.includes({Type:'Data'})&&Updates.NewData||Updates.UpdateData){
		let Data=await Database('Data',{ID:ID});
		let i=Data.reduce((A,C)=>{A=C.UID>A?E.UID:A});
		if(typeof Updates.NewData=='array')var NewData=[];
		if(typeof Updates.UpdateData=='array')var UpdateData=[];
		if(Validator&&typeof Updates.NewData=='array'){Data=Updates.NewData.filter(Validator).map(D=>{D.UID=i++;D.ID=ID})}
		if(Validator&&typeof Updates.UpdateData=='array'){Data=Updates.UpdateData.filter(Validator).filter(D=>(Data.find(E=>E.UID==D.UID)&&D.ID==ID))}
		if(NewData)for(let i=0;i<NewData.length)await Database.Insert('Data',NewData[i]);
		if(UpdateData)for(let i=0;i<NewData.length)await Database.Update('Data',{ID:ID,UID:NewData.UID},NewData[i]);
	}
	return true;
}
//!Resource Log
//=Logs submitted Data
//:ID (string) the ID of the Resource being Logged to
//:A (object) the Account object logging the data
//:Log (string) the target Key the Data will be logged under
//:Data (object) the Data to Log
Resource.Log=async(ID,A,Log,Data)=>{
	let Meta=await Database('Meta',{ID:ID}).then(E=>{if(E[0]){return E[0]}else{throw 16}});
	let Access=Account.Access(A,Meta.Access);
	if(!Access[Log])throw 11;
	Data.ID=ID;
	Data.Account=A.ID;
	Data.Date=Math.floor(Date.now()/1000);
	await Database('Log',Data);
	return true;
}
//!Export
module.exports=Resource;