var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const querystring = require('querystring');
const URL = require('url');
var jsonOp=require("C:/Users/Guanglin12/Desktop/cyh/wxcrawler/jsonOperation.js");
var fs = require('fs');

//var multer=require('multer');



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data

global.load=[];
global.data=[];

app.set('views','C:/Users/Guanglin12/Desktop/cyh/wxcrawler')
app.set('view engine','jade');


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/getMsgJson',function(req,res){
	var str=req.body.str
	var url=req.body.url
	
	//console.log(decodeURIComponent(url));
	var urlObj = URL.parse(decodeURIComponent(url),true);
	var __biz=urlObj.query.__biz;
	//console.log(JSON.stringify(urlObj));
	//console.log(__biz);
	var str_decode=escapeHTML((decodeURIComponent(str)));
	var strObj=JSON.parse(str_decode);
	//console.log(JSON.stringify(str_decode));

	//console.log(strObj);

	//相当于读取数据库
	var file="test.json";
	//var data=fs.readFileSync(file).toString(); 
	//var data=[];
	var fileTemp="load.json";
	

	for(var i=0;i<strObj['list'].length;i++){
		var type=strObj['list'][i].comm_msg_info.type;
		
		if(type==49){//type=49代表是图文消息
			var content_url = strObj['list'][i]['app_msg_ext_info']['content_url'].replace(/\\/g,"");//获得图文消息的链接地址
            var is_multi = strObj['list'][i]['app_msg_ext_info']['is_multi'];//是否是多图文消息
            var datetime = strObj['list'][i]['comm_msg_info']['datetime'];//图文消息发送时间
            
            var templist={
            	datetime:datetime,
            	content_url:content_url,
            	load:0
            }

            global.load.push(templist);

            //flag用来判断词条数据是否已经在数据库
            var flag=0;
            for(var n=0;n<global.data.length;n++){
    	
				if(global.data[n]['content_url']==content_url){
					flag++;
				}
			}

            // var res=jsonOp.checkContentUrl(content_url);
            // console.log(res);

            if(flag==0){
            	var fileid = strObj['list'][i]['app_msg_ext_info']['fileid'];//一个微信给的id
                var title = strObj['list'][i]['app_msg_ext_info']['title'];//文章标题
                var title_encode =encodeURI(title.replace(/&nbsp;/g,"")); //建议将标题进行编码，这样就可以存储emoji特殊符号了
                var digest = strObj['list'][i]['app_msg_ext_info']['digest'];//文章摘要
                var source_url =escapeHTML(strObj['list'][i]['app_msg_ext_info']['source_url'].replace(/\\/g,""));//阅读原文的链接
                var cover =escapeHTML(strObj['list'][i]['app_msg_ext_info']['cover'].replace(/\\/g,""));//阅读原文的链接

                var is_top = 1;//标记一下是头条内容



                var myData = {
                	content_url:content_url,
                	is_multi:is_multi,
                	datetime:datetime,
                	fileid:fileid,
                	title:title_encode,
                	digest:digest,
                	source_url:source_url,
                	cover:cover,
                	is_top:is_top
                }
                
                

                global.data.push(myData);

               
    //             var outputFilename = 'C:/Users/Guanglin12/Desktop/cyh/wxcrawler/test.json';

    //             fs.writeFile(outputFilename, JSON.stringify(myData), function(err) {
				//     if(err) {
				    	
				//         console.log(err);
				//     } else {
				//       console.log("JSON saved to " + outputFilename);
				//     }
				// });
            }
            if(is_multi==1){//多图文消息
            		for(var m=0;m<strObj['list'][i]['app_msg_ext_info']['multi_app_msg_item_list'].length;m++){
            			var content_url = strObj['list'][i]['app_msg_ext_info']['multi_app_msg_item_list'][m]['content_url'].replace(/\\/g,"");//获得图文消息的链接地址

            			templist={
			            	datetime:datetime,
			            	content_url:content_url,
			            	load:0
			            }
			            global.load.push(templist);

            			var flag2=0;
			            for(var n=0;n<global.data.length;n++){
			    	
							if(global.data[n]['content_url']==content_url){
								flag2++;
							}
						}
						if(flag2==0){
							var fileid = strObj['list'][i]['app_msg_ext_info']['fileid'];//一个微信给的id
			                var title = strObj['list'][i]['app_msg_ext_info']['title'];//文章标题
			                var title_encode =encodeURI(title.replace(/&nbsp;/g,"")); //建议将标题进行编码，这样就可以存储emoji特殊符号了
			                var digest = strObj['list'][i]['app_msg_ext_info']['digest'];//文章摘要
			                var source_url =escapeHTML(strObj['list'][i]['app_msg_ext_info']['source_url'].replace(/\\/g,""));//阅读原文的链接
			                var cover =escapeHTML(strObj['list'][i]['app_msg_ext_info']['cover'].replace(/\\/g,""));//阅读原文的链接


						}

						var myData = {
		                	content_url:content_url,
		                	is_multi:is_multi,
		                	datetime:datetime,
		                	fileid:fileid,
		                	title:title_encode,
		                	digest:digest,
		                	source_url:source_url,
		                	cover:cover
		                	
		                }
		                
		                

		                global.data.push(myData);

            		}
            }
		}

	}
    		



	//var url2 = URL.parse(url)
	//var biz=url2.query.__biz

});

function escapeHTML(a) {
 return a.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, '&').replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
}



app.get('/getWxHis',function(req,res){
	
	
	
	var content_url;
	for(var i=0;i<global.load.length;i++){
		if(global.load[i].load=="0"){
			content_url=global.load[i].content_url;
			global.load[i].load=1;
			break;
		}
	}
	content_url=content_url.replace(/&amp;/g,'&');//不知道为什么第一次解析特殊字符时，&解析失败，只能再次单独解析
	//console.log(content_url);
	res.write("<script>setTimeout(function(){window.location.href='"+content_url+"';},2000);</script>")
});

app.post('/getMsgExt',function(req,res){

	var str=req.body.str
	var url=req.body.url
	
	//console.log(decodeURIComponent(url));
	var urlObj = URL.parse(decodeURIComponent(url),true);
	var __biz = urlObj.query.__biz;
	var __sn=urlObj.query.sn;
	//console.log(JSON.stringify(urlObj));
	//console.log(__biz);
	var str_decode = escapeHTML((decodeURIComponent(str)));
	var strObj = JSON.parse(str_decode);

	// console.log(urlObj);
	// console.log(JSON.stringify(str_decode));
	// console.log(strObj);



	var read_num = strObj['appmsgstat']['read_num'];//阅读量
    var like_num = strObj['appmsgstat']['like_num'];//点赞量

    for(var i=0;i<global.data.length;i++){
    	var content_url = global.data[i].content_url.replace(/&amp;/g,'&');
    	var urlObj2 = URL.parse(decodeURIComponent(content_url),true);
		
		var biz=urlObj2.query.__biz;
		var sn=urlObj2.query.sn;
		

		if(sn==__sn&&biz==__biz){
			global.data[i].read_num=read_num;
			global.data[i].like_num=like_num;
		}
    	
    }

    console.log(read_num+"      "+like_num);
})

app.use('/showResult',function(req,res,next){
	var outputFilename = 'C:/Users/Guanglin12/Desktop/cyh/wxcrawler/test.json';
    fs.writeFileSync(outputFilename, JSON.stringify(global.data));
    console.log("JSON saved to"+outputFilename);
    var outputTempList = 'C:/Users/Guanglin12/Desktop/cyh/wxcrawler/load.json';
	fs.writeFileSync(outputTempList, JSON.stringify(global.load));
    console.log("JSON saved to"+outputTempList);

	next();
})

app.get('/showResult',function(req,res){

	

	var data=fs.readFileSync('C:/Users/Guanglin12/Desktop/cyh/wxcrawler/test.json').toString(); 
	//data=JSON.parse(data);
	var load=fs.readFileSync('C:/Users/Guanglin12/Desktop/cyh/wxcrawler/load.json').toString();
	//load=JSON.parse(load);
	// res.writeHead(200,{'Content-Type':'text/html'})
	// res.write(data);
	// res.write("<br><br><br>")
	// res.write(load);
	data=JSON.parse(decodeURIComponent(data));
	

	//console.log(data);
	res.render('result',{
		result:data
	})

})







var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});