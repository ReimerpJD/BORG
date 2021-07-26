const FS=require('fs');
const Path=require('path');
const Read=require('readline');
const Encryption=require('crypto');
const Scrypt=Encryption.scryptSync;
const Documentation=require(Path.join(__dirname,'..','Framework','Documentation'));
const Reading=Read.createInterface({input: process.stdin,output:process.stdout});
var Pass={};
async function Prompt(Text){
	return new Promise(Resolve=>Reading.question(Text,Answer=>Resolve(Answer)));
}
async function Init(){
	let Prompts={
		environment:'I will create or replace the .env file using values you will be prompted to provide\n',
		dbinit:'I will initialize the database, collections, and indexing\n',
		errors:'I will fill the mongodb Error collection using the Error.json file objects\n',
		server:'I will fill the mongodb Messages collection (which holds user response messages in different languages) using the Messages.json file objects\n',
		revres:'I will replace the Messages.json file with a new file using the mongodb Messages collection entries\n',
		admin:'I will create the server Admin account using credentials you will be prompted to provide\n',
		preface:'I will perform the following operations:\n',
		continue:'May I continue? [y/n]\n'
	}
	let DefaultList=Prompts.preface
		+Prompts.environment
		+Prompts.dbinit
		+Prompts.errors
		+Prompts.server
		+Prompts.admin
		+Prompts.continue;
	let Parameters=process.argv.slice(2);
	let Default=Parameters.length==0;
	if (!Default&&Parameters.includes('server')&&Parameters.includes('revres'))throw 'Running the server and revres options together is foolish';
	let List=``;
	if(Default){List+=DefaultList}else{Parameters.forEach(Setting=>{Prompts[Setting]?List+=Prompts[Setting]:false;});List+=Prompts.continue;}
	if(Default||(Parameters.length>0&&Parameters.some(Element=>{if(Prompts[Element]){return true}})))var Permission=await Prompt(List);
	await Init.Begin(Permission)
	.then(()=>Init.Environment(Default||Parameters.includes('environment')))
	.then(()=>Init.Loadenv(Default||Parameters.includes('dbinit')||Parameters.includes('errors')||Parameters.includes('server')||Parameters.includes('revres')||Parameters.includes('admin')))
	.then(()=>Init.DB(Default||Parameters.includes('dbinit')))
	.then(()=>Init.Errors(Default||Parameters.includes('errors')))
	.then(()=>Init.Server(Default||Parameters.includes('server')))
	.then(()=>Init.ID(Default||Parameters.includes('id')))
	.then(()=>Init.Revres(Parameters.includes('revres')&&!Default||Parameters.includes('server')))
	.then(()=>Init.Admin(Default||Parameters.includes('admin')))
	.then(()=>{(console.log('I\'ve finished, goodbye'),process.exit())});
}
Init.Begin=async(Permission)=>{
	if(Permission=='y')return true;
	if(Permission=='n')(console.log('fine then, bye'),process.exit());
	(console.log('you didn\' give me enough information to begin :/'),process.exit());
}
Init.Environment=async(execute)=>{
	if(!execute)return false;
	let body='';
	let env=[
		{prompt:'What is the name of the Server?\n',variable:'TITLE'},
		{prompt:'What is the name of the SSL key file?\n',variable:'SSL_KEY'},
		{prompt:'What is the name of the SSL cert file?\n',variable:'SSL_CERT'},
		{prompt:'What is the ISO 639-1 code of the default server language you want set?\n',variable:'DEFAULT_LANGUAGE'},
		{prompt:'Will account creation be open? (y/n)\n',variable:'ACCOUNT_CREATION'},
		{prompt:'What is the CSS setting of the default background (css value: image, color, gradient, ...) you want?\n',variable:'DEFAULT_BACKGROUND'},
		{prompt:'What is the CSS the default page/background color you want?\n',variable:'DEFAULT_COLOR'},
		{prompt:'What is the 6-digit hex code (excluding the # symbol) of the default text color you want?\n',variable:'DEFAULT_TEXT'},
		{prompt:'What is the mongodb database named?\n',variable:'MONGO_DATABASE'},
		{prompt:'What is node\'s mongodb user named?\n',variable:'MONGO_USER'},
		{prompt:'What is node\'s mongodb user password?\n',variable:'MONGO_PASSWORD'},
		{prompt:'What is node\'s mongodb host IP, URL, or Unix socket?\n',variable:'MONGO_HOST'},
		{prompt:'What is node\'s mongodb port?\n',variable:'MONGO_PORT'},
		{prompt:'What is node\'s redis host IP, URL, or Unix socket?\n',variable:'REDIS_HOST'},
		{prompt:'What is node\'s redis port?\n',variable:'REDIS_PORT'}
	];
	for(let i=0;i<env.length;i++){let Value=await Prompt(env[i].prompt);body+=env[i].variable+'='+encodeURIComponent(Value)+'\n'}
	FS.writeFileSync(Path.join('Framework','.env'),body);
	console.log('I created the file');
}
Init.Loadenv=async(execute)=>{
	if(!execute)return false;
	let Environment=Documentation.Environment(Path.join('Framework','.env'),__dirname,process.env);
	if(!Environment)throw 'Missing .env file!';
	let Mongo=require('mongodb').MongoClient;
	let MongoURL='mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASSWORD+'@'+process.env.MONGO_HOST+':'+process.env.MONGO_PORT+'/';
	let MongoOptions={useNewUrlParser:true,useUnifiedTopology:true};
	var Database=process.env.MONGO_DATABASE;
	Pass.Connection=await Mongo.connect(MongoURL,MongoOptions);
	console.log('I interpreted the .env file and established Connection to the database');
}
Init.DB=async(execute)=>{
	if(!execute)return false;
	await Pass.Connection.db(process.env.MONGO_DATABASE).dropDatabase();
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('ID',{validator:{$jsonSchema:{bsonType:'object',
		required:['Type','Value'],
		properties:{
			Type:{bsonType:'string'},
			Value:{bsonType:'int'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Accounts',{validator:{$jsonSchema:{bsonType:'object',
		required:['ID','Tag','Name','Password','Salt','Groups','Languages'],
		properties:{
			ID:{bsonType:'string'},
			Tag:{bsonType:'string'},
			Name:{bsonType:'object'},
			Password:{bsonType:'string'},
			Email:{bsonType:'string'},
			Salt:{bsonType:'string'},
			Groups:{bsonType:'array'},
			Languages:{bsonType:'array'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Accounts').createIndex({ID:1},{Name:'AccountID',unique:true});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Accounts').createIndex({Password:1},{Name:'AccountGroupFinder'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Accounts').createIndex({Name:1},{Name:'AccountNameSearch'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Accounts').createIndex({Groups:1},{Name:'AccountGroups'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Meta',{validator:{$jsonSchema:{bsonType:'object',
		required:['ID','Title','Access','Languages','Owner'],
		properties:{
			ID:{bsonType:'string'},
			Contexts:{bsonType:'array'},
			Libraries:{bsonType:'array'},
			Main:{bsonType:'string'},
			Text:{bsonType:'string'},
			Headers:{bsonType:'array'},
			Body:{bsonType:'array'},
			Footers:{bsonType:'array'},
			Title:{bsonType:'object'},
			Access:{
				bsonType:'object',
				required:['Blacklist','Know','View','Edit'],
				properties:{
					Blacklist:{bsonType:'array'},
					Know:{bsonType:'array'},
					View:{bsonType:'array'},
					Edit:{bsonType:'array'}
				}
			},
			Log:{bsonType:'object'},
			Languages:{bsonType:'array'},
			Owner:{bsonType:'string'},
			Authors:{bsonType:'array'},
			Record:{bsonType:'array'},
			Expired:{bsonType:'bool'},
			Featured:{bsonType:'bool'},
			Tags:{bsonType:'object'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({ID:1},{Name:'ResourceID',unique:true});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({"Title.$**":1},{Name:'ResourceTitleSearch'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({Featured:1},{Name:'ResourceFeatured'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({Languages:1},{Name:'ResourceLanguages'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({Libraries:1},{Name:'ResourceLibraries'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({Owner:1},{Name:'ResourceOwners'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({Authors:1},{Name:'ResourceAuthors'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Meta').createIndex({"Tags.$**":1},{Name:'ResourceTags'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Data',{validator:{$jsonSchema:{bsonType:'object',
		required:['UID','ID','Parent','Type','Meta'],
		properties:{
			ID:{bsonType:'string'},
			Parent:{bsonType:'string'},
			Type:{bsonType:'string'},
			Conditions:{bsonType:'object'},
			Meta:{bsonType:'object'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Data').createIndex({UID:1},{Name:'DataUID',unique:true});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Data').createIndex({ID:1},{Name:'ParentResourceID'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Errors',{validator:{$jsonSchema:{bsonType:'object',
		required:['Code','Error','Description','Message'],
		properties:{
			Code:{bsonType:'int'},
			Error:{bsonType:'string'},
			Description:{bsonType:'string'},
			Message:{bsonType:'int'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Errors').createIndex({Code:1},{Name:'ErrorCode',unique:true});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Messages',{validator:{$jsonSchema:{bsonType:'object',
		required:['Code','Status','Message'],
		properties:{
			Code:{bsonType:'int'},
			Status:{bsonType:'int'},
			Message:{bsonType:'object'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Messages').createIndex({Code:1},{Name:'MessageCode',unique:true});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Log',{validator:{$jsonSchema:{bsonType:'object',
		required:['ID','Account','Date','Key','Data'],
		properties:{
			ID:{bsonType:'string'},
			Account:{bsonType:'string'},
			Date:{bsonType:'timestamp'},
			Key:{bsonType:'string'},
			Data:{bsonType:'object'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Log').createIndex({ID:1},{Name:'LogID'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Log').createIndex({Account:1},{Name:'LogAccount'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Log').createIndex({ID:1,Key:1},{Name:'LogIDKey'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Log').createIndex({ID:1,Account:1},{Name:'LogIDAccount'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Log').createIndex({ID:1,Account:1,Key:1},{Name:'LogIDAccountKey'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Language',{validator:{$jsonSchema:{bsonType:'object',
		required:['Key','Message'],
		properties:{
			Key:{bsonType:'string'},
			Message:{bsonType:'object'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Language').createIndex({ID:1},{Name:'LanguageKey'});
	await Pass.Connection.db(process.env.MONGO_DATABASE).createCollection('Languages',{validator:{$jsonSchema:{bsonType:'object',
		required:['Key','Name','English'],
		properties:{
			Key:{bsonType:'string'},
			Name:{bsonType:'string'},
			English:{bsonType:'string'}
		}
	}}});
	await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Languages').createIndex({ID:1},{Name:'LanguagesKey'});
	await Init.Import(Path.join(__dirname,'Meta.json'),'Meta');
	await Init.Import(Path.join(__dirname,'Data.json'),'Data');
	await Init.Import(Path.join(__dirname,'Languages.json'),'Languages');
	await Init.Import(Path.join(__dirname,'Accounts.json'),'Accounts');
	console.log('I initialized the database collections and indexing');
}
Init.Import=async(File,Collection)=>{
	let Data=[];
	if (!FS.existsSync(File)) throw 'Missing '+Collection+' Initialization File';
	FS.readFileSync(File,'utf-8').split('\n').forEach(Element=>{if(Element!="")Data.push(JSON.parse(Element))});
	if(Data.length>0)await Pass.Connection.db(process.env.MONGO_DATABASE).collection(Collection).insertMany(Data);
	return true;
}
Init.Errors=async(execute)=>{
	if(!execute)return false;
	await Init.Import(Path.join(__dirname,'Errors.json'),'Errors');
	console.log('I have filled the Errors collection');
}
Init.Server=async(execute)=>{
	if(!execute)return false;
	await Init.Import(Path.join(__dirname,'Messages.json'),'Messages');
	await Init.Import(Path.join(__dirname,'Language.json'),'Language');
	console.log('I have filled the Messages collection');
}
Init.ID=async(execute)=>{
	if(!execute)return false;
	await Init.Import(Path.join(__dirname,'ID.json'),'ID');
	console.log('I have filled the ID collection');
}
Init.Revres = async function (execute) {
	if(!execute)return false;
	let body='';
	let Messages=await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Messages').find({}).toArray();
	Messages.forEach(Object=>{body+=JSON.stringify(Object)+'\n'});
	FS.writeFileSync(Path.join(__dirname,'RevresMessages.json'),body);
	let Language=await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Language').find({}).toArray();
	Language.forEach(Object=>{body+=JSON.stringify(Object)+'\n'});
	FS.writeFileSync(Path.join(__dirname,'RevresLanguage.json'),body);
}
Init.Admin=async(execute)=>{
	if(!execute)return false;
	let Password=await Prompt('What will the admin password be?\n',{hideEchoBack:true});
	let ConfirmP=await Prompt('Retype that password, for confirmation\n',{hideEchoBack:true});
	if (Password==ConfirmP){
		let Salt=Encryption.randomBytes(32).toString('hex');
		let Hash=Scrypt(Password,Salt,64).toString('hex');
		let Attempts=0;
		await Pass.Connection.db(process.env.MONGO_DATABASE).collection('Accounts').insertOne({ID:'0',Tag:'Hortulanus',Name:{[process.env.DEFAULT_LANGUAGE]:'Admin'},Password:Hash,Salt:Salt,Groups:[],Languages:[process.env.DEFAULT_LANGUAGE]});
		console.log('I created the admin account');
	} else {
		console.log('You typed in two different passwords, you\ll have to try again after');
	}
}
Init();