var fs=require('fs');



exports.checkContentUrl=function(url){

	var file="test.json";


	var data=fs.readFileSync(file).toString(); 
	console.log(data);   
	        
    if(data==null){
    	

    	return false;
    } 
   
    for(var i=0;i<data.length;i++){
    	
		if(data[i]['content_url']==url){
			

			return true;
		}else{
			
			return false;
		}
	}
}  
