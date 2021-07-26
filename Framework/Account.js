//#Framework Account Module
//!Imports
const FS=require('fs');
const Path=require('path');
const Encryption=require('crypto');
const Scrypt=Encryption.scryptSync;
const Database=require(__dirname,'Database'));
//!Account Login Function
//=Authenticates the account to the credentials submitted
//:Tag (string) Account tag
//:Password (string) cleartext account password
//$Censored Account Object
//&Missing or Invalid Inputs: Error 12
//&Account Missing: Error 13
//&Acount Locked: Error 42
//&Authentication Failure: false
async function Account(Tag,Password,NoKey){
	if(typeof Tag!='string'||typeof Password!='string')throw 12
	let Meta=await Account.Meta(false,Tag,true);
	if(!Meta)throw 13;
	if(Meta.Locked)throw 42;
	let Strikes=await Database.Get('Account:'+Meta.ID+':Strikes');
	if(Strikes>9)throw 42
	let Hash=Scrypt(Password.toString(),Meta.Salt,64).toString('hex');
	if(Hash!=Meta.Password){Database.Set('Account:'+Meta.ID+':Strikes',Strikes++);return {Type:'Action',Data:{Name:'Login',Result:false}}}
	if(NoKey)return true;
	let Keys=Encryption.generateKeyPairSync('rsa',{modulusLength:4096,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
	await Database.Set('Account:'+Meta.ID+':Strikes',0);
	let Set=await Database.Set('Account:'+Meta.ID+':Key',Keys.publicKey);
	return Keys,privateKey;
}
//!Account Meta
//=Returns Account the account object of the specified account from the database
//:ID (string) the ID of the requested account
//:Tag (string) the Tag of the requested account
//:Preserve (boolean) whether or not to preserve the account data or censor it to be sent in a response
//$Account Object
//&Missing or Invalid Inputs: Error 12
Account.Meta=async(ID,Tag,Preserve)=>{
	if(typeof ID!='string'&&typeof Tag!='string')throw 12;
	let Key=ID?'ID':'Tag';
	let M=await Database('Accounts',{[Key]:(ID?ID.toString():Tag.toString())});
	let A=await M[0]?M[0]:false;
	if(A&&!Preserve)delete A['_id'];
	if(A&&!Preserve)delete A.Password;
	if(A&&!Preserve)delete A.Salt;
	return A;
}
//!Account Authorize
//=Compares decrypted challenge string to the one generated for the account last using Account Challenge
//:AID (string) the account id
//:Key (string) the decrypted challenge string
//:Password (string) the plaintext account password
//$Boolean (if the client-decrypted string matches)
Account.Authorize=async(Authorization)=>{
	if(Authorization&&Authorization.ID&&Authorization.ID=='1')return false;
	if(typeof Authorization!='object'||typeof Authorization.ID!='string'||(typeof Authorization.Key!='string'&&typeof Authorization.Password!='string'))throw 12;
	if(Authorization.Override)return true;
	let Pass=false;
	if(Authorization.Key){
		Pass=await Database.Get('Account:'+Authorization.ID+':String').then(S=>S==Authorization.Key);
		if(Pass)Database.Delete('Account:'+Authorization.ID+':String');
	}else{
		let Meta=await Account.Meta(Authorization.ID,false,true);
		if(!Meta)throw 13;
		if(Meta.Locked)throw 42;
		let Strikes=await Database.Get('Account:'+Meta.ID+':Strikes');
		if(Strikes>9)throw 42
		let Hash=Scrypt(Authorization.Password,Meta.Salt,64).toString('hex');
		Pass=Hash==Meta.Password;
		if(!Pass)Database.Set('Account:'+Meta.ID+':Strikes',Strikes?Strikes++:1)
	}
	return Pass;
}
//!Account Challenge
//=Returns a challenge string for account authentication
//:ID (string) the AID of the account to challenge
Account.Challenge=async(ID)=>{
	if(typeof ID!='string')throw 12;
	let Key=await Database.Get('Account:'+ID+':Key');
	if(!Key)return {Type:'Action',Data:{Name:'Challenge',Result:false}};
	let String=Encryption.randomBytes(256);
	await Database.Set('Account:'+ID+':String',String.toString('base64'));
	return Encryption.publicEncrypt({key:Key,padding:Encryption.constants.RSA_PKCS1_OAEP_PADDING},String).toString('base64');
}
//!Account Logout
//=Flushes the account authentication key
//:ID (string) the ID of the account
//$true
//-Failures will result in errors thrown by the Database.Delete function
Account.Logout=async(ID)=>{
	if(typeof ID!='string')throw 12;
	await Database.Delete('Account:'+ID+':Key');
	await Database.Delete('Account:'+ID+':String');
	return true;
}
//!Account Access
//=Returns an object representing the access the account has to the resource
//:A (object) Account object
//:R (object) Resource Meta object
//$Access Object
Account.Access=(A,R)=>{
	if(typeof A!='object'||typeof R!='object')throw 12;
	if(R.Blacklist&&(R.Blacklist.includes(A.ID)||R.Blacklist.some(Element=>A.Groups.includes(Element)))){throw 11}else{delete R.Blacklist}
	let Access={};
	let Keys=Object.keys(R);
	for(let i=0;i<Keys.length;i++)Access[Keys[i]]=(R[Keys[i]].includes('1')||R[Keys[i]].includes(A.ID)||R[Keys[i]].some(Element=>A.Groups.includes(Element)));
	return Access;
}
//!Account Access
//=Returns an object representing the access the account has to the resource
//:A (object) Account object
//:R (object) Resource Meta object
//$Access Object
Account.Creator=(A)=>{
	if(typeof A!='object'||typeof R!='object')throw 12;
	let R=false;
	if(A.Groups.includes('2')R=true;
	return R;
}
//!Account Language
//=Returns the best suited language from the parameters given
//:Requested (string) iso 639-1 code for requested language
//:Accept (array) iso 639-1 codes for acceptable languages
//:Available (array) iso 639-1 codes for the available language
Account.Language=(Requested,Accept,Available)=>{
	if(typeof Requested!='string'||typeof Accept!='array'||typeof Available!='array')throw 12;
	if(!Accept)Accept=[];
	if(!Requested)Requested=Accept[0]?Accept[0]:process.env.DEFAULT_LANGUAGE;
	let Deafult=process.env.DEFAULT_LANGUAGE?process.env.DEFAULT_LANGUAGE:'la';
	if(Available.includes(Requested))return Requested;
	let Options=Available.filter(Element=>Accept.includes(Element));
	if(Options&&Options[0])return Options[0]
	if(Available.includes(process.env.DEFAULT_LANGUAGE))return process.env.DEFAULT_LANGUAGE;
	return Available[0];
}
//!Account Create
//=Creates a new account using the data object given
//:Data (object) new account's Tag, Names, Password, Languages, Email (if given), and Groups (if given and Admin)
//$Boolean (upon success)
//&Missing or Invalid Inputs: Error 12
Account.Create=async(Data,Admin)=>{
	if(typeof Data!='object'||typeof Data.ID!='string'||typeof Data.Tag!='string'||typeof Data.Name!='object'||typeof Data.Password!='string'||typeof Data.Languages!='array')throw 12;
	let ID=await Database.ID('Account');
	let Salt=Encryption.randomBytes(32).toString('hex');
	let Hash=Scrypt(Data.Password,Salt,64).toString('hex');
	let P=await Database.Insert('Accounts',{ID:ID,Name:Data.Name,Password:Hash,Salt:Salt,Languages:Data.Languages,Email:Data.Email?Data.Email:false,Groups:(Data.Groups&&Admin)?Data.Groups:[]});
	return P?true:false;
}
//!Account Validate
//=Validates inputs for updating or creating an account
Account.Validate=async(Values)=>{
	if(typeof Values!='object')throw 12;
	let Validity={};
	if(Values.Tag)Validity.Tag=await Account.Meta(false,Values.Tag).then(M=>M?false:true);
	if(Values.Name){
		let Languages=Object.keys(Values.Name);
		let Linguae=await Database.Keys('Lingua:*');
		let LV=Languages.every(L=>Linguae.includes(L));
		let NV=Languages.every(L=>{return (typeof Values.Name[L]=='string'&&Values.Name[L].length>100)});
		Validity.Name=(LV&&NV);
	}
	if(Values.Password)Validity.Password=(Values.Password=='string');
	if(Values.Email)Validity.Password=(Values.Password=='string'&&Values.Password.includes('@'));
	//if(Values.Groups)Validity.Tag=false;
	if(Values.Languages){
		let Linguae=await Database.Keys('Lingua:*');
		let LV=Values.Languages.every(L=>Linguae.includes(L));
		Validity.Languages=LV;
	}
	return Validity;
}
//!Account Update
//=Updates an account using the data object given
//:Data (object) new data to update the account with (Tag, Names, Password, Languages, Email, and Groups (if Admin))
//$Boolean (upon success)
//&Missing or Invalid Inputs: Error 12
Account.Update=async(Data,Admin)=>{
	if(typeof Data!='object'||typeof Data.ID!='string'||typeof Data.Tag!='string'||typeof Data.Name!='object'||typeof Data.Password!='string'||typeof Data.Languages!='array')throw 12;
	let Updates={};
	if(Data.Name)Updates.Name=Data.Name;
	if(Data.Languages)Updates.Languages=Data.Languages;
	if(Data.Email)Updates.Email=Data.Email;
	if(Admin&&Data.Groups)Updates.Groups=Data.Groups;
	if(Data.Password){
		let Salt=Encryption.randomBytes(32).toString('hex');
		let Hash=Scrypt(Data.Password,Salt,64).toString('hex');
		Updates.Password=Hash;
		Updates.Salt=Salt;
	}
	if(Data.Tag){
		let Taken=await Database('Accounts',{Tag:Data.Tag}).then(A=>A.length>0);
		if(!Taken){Updates.Tag=Data.Tag}else{throw 12}
	}
	let P=await Database.Update('Accounts',{ID:Data.ID},Updates);
	return P?true:false;
}
//!Account Delete
//=Updates an account using the data object given
//:ID (string) the ID of the account to delete
//$Boolean (upon success)
//&Missing or Invalid Inputs: Error 12
Account.Delete=async(ID)=>{
	if(typeof ID!='string')throw 12;
	let P=await Database.Erase('Accounts',{ID:Data.ID},Updates);
	return P?true:false;
}
//!Export
module.exports=Account;