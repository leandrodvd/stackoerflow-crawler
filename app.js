var request = require('request');
var async = require('async');
var fs = require('fs');


function getSOData(callback, page,tag,filter){
  // /2.2/search?page=1&pagesize=100&order=desc&sort=activity&tagged=mobilefirst&site=stackoverflow&filter=!gB66oJbwvbd250j_ZlGasMMsPHB4-XAsIYn

  console.log('requesting page '+page);
  request(
      { method: 'GET'
      , uri: 'http://api.stackexchange.com/2.2/search?page='+page+'&pagesize=100&order=desc&sort=activity&tagged='+tag+'&site=stackoverflow&filter='+filter
      , gzip: true
      }
    , function (error, response, body) {
        // body is the decompressed response body
        //console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
        //console.log('the decoded data is: ' + body)
        callback(error,body);
      }
    )
}

function crawSOData(callback,tag,filter){
  var nextPage=1;
  var jsonResponse=[];
  var has_more=false;
  var fn = function(callback){
    var getSODataCallback=function(err,res){
      //this is the function executed for each page request and contains the page content in res
       if(err){
         callback(err);
         return;
       }
       var results = JSON.parse(res);
       console.log('response page:'+results.page);
       jsonResponse=jsonResponse.concat(results.items);
       has_more=results.has_more;
       nextPage++;
       callback(null,jsonResponse);
    };
    getSOData(getSODataCallback,nextPage,tag,filter);
  }
  var test = function(){
    return has_more;
  }

  async.doWhilst(fn, test, callback);


}


function processFinalResult(err,res){
  if(err){
    console.error(err);
    return;
  }
    console.log('Total results obtained:'+res.length);
    var csvResult='';

    for(item=0;item<res.length;item++){
      csvResult +=res[item].title+',';
      for(tagIndex=0;tagIndex<res[item].tags.length;tagIndex++){
        console.log('tag '+res[item].tags[tagIndex]);
        if(tagIndex==res[item].tags.length-1){
          csvResult+=res[item].tags[tagIndex];
        }
        else{
          csvResult+=res[item].tags[tagIndex]+",";
        }

      }
      csvResult += '\n';

    }
    console.log(csvResult);
    fs.writeFile("result.txt", csvResult, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });



}

crawSOData(processFinalResult,'mobilefirst','cI32l15iiHFDP_1s*WG6exVjPBfT9(SQ9G');
