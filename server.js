const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const mongodbModel = require('./mongo');
const Email = require('email-templates');
//const mongodbObj = new mongodbModel('mobile','users');

http.createServer((req,res)=>{
    var dir = path.join(__dirname, req.url);
    //switch on different http request
    switch(req.url){
        case "/":
            //main page
        case "/index.html":
            var data = fs.readFileSync('index.html','utf-8');
            res.statusCode = 200;
            res.write(data);
            res.end();
            break;
        //sign in check
        case "/signin":
            //receive sign in info through ajax
            var str="";
            req.on('data',function(chunk){
                str += chunk;
            })
            req.on('end',function(){
                //parse received string to object
                var obj = qs.parse(str);
                //connect mongodb
                var mongodbObj = new mongodbModel('mobile','users');
                mongodbObj.init();
                //check through database to match the sign in user
                mongodbObj.find({email:obj.email,password:obj.password},function(err,data){
                    if(err)throw err;
                    //if find a user
                    if(data.length>0){
                        //send use name info back to client
                        sendData(res,{user:data[0].name});
                    }else{
                        //if not, send an empty string as user.
                        sendData(res,{user:''});
                    }
                })
            })
            break;
        case "/forget":
            //receive sign in info through ajax
            var str="";
            req.on('data',function(chunk){
                str += chunk;
            })
            req.on('end',function(){
                //parse received string to object
                var obj = qs.parse(str);
                //connect mongodb
                var mongodbObj = new mongodbModel('mobile','users');
                mongodbObj.init();
                //check through database to match the sign in user
                mongodbObj.find({email:obj.email},function(err,data){
                    if(err)throw err;
                    //if find a user
                    console.log(data);
                    if(data.length>0){
                        const email = new Email({
                            message: {
                                from: 'system@coffeeshop.com'
                            },
                            // uncomment below to send emails in development/test env:
                            // send: true
                            transport: {
                                jsonTransport: true
                            }
                        });

                        email
                            .send({
                                template: 'mars',
                                message: {
                                    to: data[0].email
                                },
                                locals: {
                                    name: data[0].name,
                                    pwd:data[0].password
                                }
                            })
                            .then(console.log("send out a email"))
                            .catch(console.error);
                        sendData(res,{msg:true});
                    }else{
                        //if not, send an empty string as user.
                        sendData(res,{msg:false});
                    }
                })
            })
            break;
        case "/signup":
            //receive sign up info through ajax
            var str="";
            req.on('data',function(chunk){
                str += chunk;
            })
            req.on('end',function(data){
                //parse received string to object
                var obj = qs.parse(str);
                //connect mongodb
                var mongodbObj = new mongodbModel('mobile','users');
                mongodbObj.init();
                mongodbObj.find({email:obj.email},function(err,data){
                    if(err)throw err;
                    //if find a a user with same email
                    if(data.length>0){
                        //send message as has been registered
                        sendData(res,{msg:'registered'});
                    }else{
                        //if email still available, insert sign up info into database
                        mongodbObj.insert({name:obj.name,email:obj.email,password:obj.password},function(err,result){
                            if(err){
                                sendData(res,{msg:err});
                            }else{
                                //after inserted, send back info as success
                                sendData(res,{msg:'success'});
                            }
                        })
                    }
                })
            })
            break;
        case "/checkuser":
            //receive user info through ajax
            var str="";
            req.on('data',function(chunk){
                str += chunk;
            })
            req.on('end',function(data){
                var obj = qs.parse(str);
                //connect mongodb
                var mongodbObj = new mongodbModel('mobile','users');
                mongodbObj.init();
                mongodbObj.find({name:obj.name},function(err,data){
                    //console.log(data);
                    if(err)throw err;
                    //if find this user, send back true to prove the cookie matches the user name
                    if(data.length>0){
                        sendData(res,{msg:true});
                    }else{
                        //cookie does not match the user name
                        sendData(res,{msg:false});
                    }
                })
            })
            break;
        case "/productList":
            var mongodbObj = new mongodbModel('mobile','products');
            mongodbObj.init();
            //retrieve all products data
            mongodbObj.find({},function(err,data){
                if(err)throw err;
                //send data back to front page
                sendData(res,data);
            })
            break;
        case "/findProduct":
            //receive product id info through ajax
            var str="";
            req.on('data',function(chunk){
                str += chunk;
            })
            req.on('end',function(data){
                var obj = qs.parse(str);
                //connect mongodb
                var mongodbObj = new mongodbModel('mobile','products');
                mongodbObj.init();
                //find the product with this id
                mongodbObj.find({id:parseInt(obj.id)},function(err,data){
                    if(err)throw err;
                    sendData(res,data);
                })
            })
            break;
        case "/couponList":
            var mongodbObj = new mongodbModel('mobile','coupons');
            mongodbObj.init();
            //retrieve all coupon data
            mongodbObj.find({},function(err,data){
                if(err)throw err;
                sendData(res,data);
            })
            break;
        default:
            if(fs.existsSync(dir)&&fs.statSync(dir).isFile()){
                //when read css file, get mime type wrong message
               var str = dir.substring(dir.indexOf(".")+1,dir.length);
                if(str=="css"){
                    //change content type to resolve the wrong message
                    res.writeHead(200,{"content-type":"text/css"});
                    res.end(fs.readFileSync(dir));
                }else{
                    res.end(fs.readFileSync(dir));
                }
            }
            break;
    }

}).listen(8800);

function sendData(res,data){
    res.writeHead(200,{"content-type":"text/plain;charset=utf-8","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"Put,Post,Get,DELETE"});
    res.end(JSON.stringify(data));
}

