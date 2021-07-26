//#Framework Database Module
//!Imports
const Path=require('path');
const Mongo=require('mongodb').MongoClient;
const MongoURL='mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASSWORD+'@'+process.env.MONGO_HOST+':'+process.env.MONGO_PORT+'/';
const MongoOptions={useNewUrlParser:true,useUnifiedTopology:true};
const MongoDatabase=process.env.MONGO_DATABASE;
const Redis=require('redis').createClient({host:process.env.REDIS_HOST,port:process.env.REDIS_PORT});
const Util=require('util');
//!Database Function
//=General purpose interface for querying the MongoDB database
//:Collection (string) the collection to query
//:Filters (object) the filters to query by
//$Results Array
//&Database Query Failure: Error 22
var Database=async(Collection,Filters)=>{
	if(!Connection)var Connection=await Database.Connect();
	let results=await Connection.db(MongoDatabase).collection(Collection).find(Filters).toArray().catch(()=>{throw 22});
	return results
}
//!Database Insert
//=Adds the given Data to the specified collection
//:Collection (string) the database collection to query against
//:Data (object) the Data to be set in the query
//$Returns the raw results from the query
//&Database Query Failure: Error 22
Database.Insert=async(Collection,Data)=>{
	if(!Connection)var Connection=await Database.Connect();
	let results=await Connection.db(MongoDatabase).collection(Collection).insertOne(Data).catch(()=>{throw 22});
	return results;
}
//!Database Update
//=Appends the given Data to the first matching document in the specified collection
//:Collection (string) the database collection to query against
//:Filters (object) the filters to query by
//:Data (object) the Data to be set in the query
//$Returns the raw results from the query
//&Database Query Failure: Error 22
Database.Update=async(Collection,Filters,Data)=>{
	if(!Connection)var Connection=await Database.Connect();
	let results=await Connection.db(MongoDatabase).collection(Collection).updateOne(Filters,{$set:Data}).catch(()=>{throw 22});
	return results;
}
//!Database Erase
//=Deletes the document matching the given filters from the specified database
//:Collection (string) the database collection to query against
//:Filters (object) the filters to query by
//$Returns the raw results from the query
//&Database Query Failure: Error 22
Database.Erase=async(Collection,Filters)=>{
	if(!Connection)var Connection=await Database.Connect();
	let results=await Connection.db(MongoDatabase).collection(Collection).remove(Filters).catch(()=>{throw 22});
	return results;
}
//!Database ID
//=Used to generate the next resource or account id for creation
//:Type (string) which id type to find and increment: resource (RID) or account (AID)
//$The ID queried for
Database.ID=async(Type)=>{
	let ID=await Mongo.connect(MongoURL, MongoOptions)
	.then(Connection=>Connection.db(MongoDatabase).collection('ID').findOneAndUpdate({Type:Type},{$inc:{Value:1}}))
	.then(Element=>{return Element.Value.toString(36)});
	return ID;
}
//!Database Connect
//=Creates and returns a MongoDB connection object for querying the database
Database.Connect=async()=>{return await Mongo.connect(MongoURL,MongoOptions).catch(()=>{throw 21})}
//!Database Set
//=Sets the value to the key in Redit
//:Key (string) the key to associate the value with
//:Value (string) the value set to the key
//-Redis Promisification, this was done to prevent callback hell
Database.Set=Util.promisify(Redis.set).bind(Redis);
//!Database Get
//:Key (string) the key of the value to return
//=returns a challenge string for the client to decrypt as a means of authentication
//-Redis Promisification, this was done to prevent callback hell
Database.Get=Util.promisify(Redis.get).bind(Redis);
//!Database Keys
//=Sets the value to the key in Redit
//:Key (string) the keys to search
//-Redis Promisification, this was done to prevent callback hell
Database.Keys=Util.promisify(Redis.keys).bind(Redis);
//!Database Delete
//=Sets the value to the key in Redit
//:Key (string) the key of the key-value pair to delete
//-Redis Promisification, this was done to prevent callback hell
Database.Delete=Util.promisify(Redis.del).bind(Redis);
//!Database Flush
//=Flushes the Redis database
//-Redis Promisification, this was done to prevent callback hell
Database.Flush=Util.promisify(Redis.flushall).bind(Redis);
//!Database Languages
//=Returns the all registered languages by their iso 639-1 codes
Database.Languages=async()=>{
	let K=await Database.Keys('Lingua:*');
	let R=[];
	for(let i=0;i<K.length;i++)R.push(K[i].substring(7));
	return R;
};
//!Database Language
//=Returns the requested message in the best fitting langauge available
//:Key (string) the message to get
//:Request (string) the iso 639-1 code of the requested language
//:Accept (array) the iso 639-1 codes of the acceptable languages
//$The message in the best fitting or available language
Database.Language=async(Key,Request,Accept)=>{
	let Available=await Database.Get('Language:'+Key+':Keys').then(E=>E?E.split(' '):false);
	if(!Available)return `?`;
	let Lingua=require(Path.join(__dirname,'Account')).Language(Request,Accept,Available);
	let R=await Database.Get('Language:'+Key+':'+Lingua);
	return R;
};
//!Export
module.exports=Database;

/*
//!Database Update
//:Description=General purpose update/set interface for the MongoDB database
//:Parameter=Collection (string) the collection in the database to search
//:Parameter=Filter (string) the database parameter to filter for
//:Parameter=Value (string) the value if the database parameter to find
//:Parameter=Body (object) the values to replace or set in the database
//:Returns=Returns true if successful
Database.Update=async(Collection,Filter,Value,Body)=>{
	if(!Connection)var Connection=await Database.Connect();
	if(!Connection)console.log('no connection :/');
	let Filters=(Filter&&Value)?{[Filter]:Value}:{};
	await Connection.db(MongoDatabase).collection(Collection).updateOne(Filters,{$set:Body}).catch(()=>{throw 22});
	return true;
}
//!Database Account
//:Description=Used by the Acount module to register a new user in the database
//:Parameter=ID (string) the ID the account will have
//:Parameter=Tag (string) the Tag the account will have
//:Parameter=Name (object) the Name object the account will have
//:Parameter=Hash (string) the salted and hashed password
//:Parameter=Salt (string) the salt used to hash the password
//:Parameter=Email (string) the account email
//:Parameter=Groups (array) IDs of groups the acount will belong to
//:Returns=Returns true if the creation was successful
Database.Account=async(ID,Tag,Name,Hash,Salt,Email,Groups)=>{
	if(!Connection)var Connection=await Mongo.connect(MongoURL,MongoOptions).catch(Error=>{throw 21});
	//let ID=await Database.ID('Account');
	let Success=await Connection.db(MongoDatabase).collection('Account').insertOne({ID:ID,Tag:Tag,Name:Name,Password:Hash,Salt:Salt,Email:Email,Groups:Groups}).catch(Error=>{throw 22});
	return Success?ID:false;
}
*/