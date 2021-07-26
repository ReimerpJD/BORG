//!Documentation Environment
//:Parameter 1=File (string) the full filepath of the file to retrieve the environment variables from
//:Parameter 2=Directory (string) the full filepath to set as the PATH variable in the Destination object
//:Parameter 3=Destination (object) the object which will be assigned the variables from the file
Documentation.Environment=(File,Directory,Destination)=>{
	if(!FS.existsSync(File))throw 'The .env file is missing!';
	FS.readFileSync(File,'utf-8').split('\n').forEach((Element,Index,Array)=>(Element!='')?Array[Index]=(Element=Element.split('='),Destination[Element[0]]=Element[1]):Array.splice(Index,1));
	if(Directory)Destination.PATH=Directory;
	return Destination;
}