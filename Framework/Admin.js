//#Framework Admin Module
//!Imports
const Path = require('path');
const Engine=require(Path.join(process.env.PATH,'Engines'));
const Resource=require(Path.join(__dirname,'Resource'));
const Database=require(Path.join(__dirname,'Database'));
const Account=require(Path.join(__dirname,'Account'));
//!Admin
//=Takes the Error code thrown and the Request object and generates a response
//:Code (int) Error code
//:Request (object) Request object
var Admin=async(Code,Account,Language)=>{
	let Error=await Database('Errors',{Code:Code}).then(E=>E[0]);
	let Response=await Database('Messages',{Code:Number.isInteger(Error.Message)?Error.Message:1}).then(E=>E[0]);
	if(!Response)Response={la:'Defectum Ad Partum :/'};
	let Language=Account.Language(Language,Account.Languages,Object.keys(Response));
	let Message=Response[Language];
	return Message;
}
//!Admin log
//=Configured to log the Error based on its priority/nature
//:Error (object) the Error object related to the Error code thrown
Admin.log=(Error)=>{
	if(Error.Code.toString()[0]!='1')console.log('Admin Log: '+Error.Code+' '+Error.Error);
}
//!Export
module.exports=Admin;
