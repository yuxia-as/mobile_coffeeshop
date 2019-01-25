const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webpush = require('web-push');
const path = require('path');
const mongodbModel = require('./mongo');

const server = http.createServer(app);

//convert received obj to json data
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
//for accessing static files
app.use(express.static(__dirname));


//solve the cross origin problem
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
//load the index.html page
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'index.html'));
})

//ajax call for checking if user in the database
app.post('/checkuser',function(req,res){
    //receive user info through ajax
    var user = req.body.name;
    //connect database 
    var mongodbObj = new mongodbModel('mobile','users');
    mongodbObj.init();
    mongodbObj.find({name:user},function(err,data){
        if(err)throw err;
        //if find this user, send back true msg to prove the cookie matches the user name
        if(data.length>0){
            res.json({msg:true});
        }else{
            //cookie does not match the user name
            res.json({msg:false});
        }
    })
})

//insert valid user information to the database
app.post('/signup',function(req,res){
    //receive user info through ajax
    var user = req.body;
    //connect database
    var mongodbObj = new mongodbModel('mobile','users');
    mongodbObj.init();
    mongodbObj.find({email:user.email},function(err,data){
        if(err)throw err;
        //if find a a user with same email
        if(data.length>0){
            //send message as "has been registered"
            res.json({msg:'registered'});
        }else{
            //if email still available, insert sign up info into database
            mongodbObj.insert({name:user.name,email:user.email,password:user.password},function(err,result){
                //if fail to insert user into database, send err back to client
                if(err){
                    res.json({msg:err});
                }else{
                    //after inserted, send back info as success
                    res.json({msg:'success'});
                }
            })
        }
    })
})

//check if user has an account and return the user name if he has one 
app.post('/signin',function(req,res){
    //receive sign in info through ajax
    var user = req.body;
    var mongodbObj = new mongodbModel('mobile','users');
    mongodbObj.init();
        //check through database to match the sign in user
    mongodbObj.find({email:user.email,password:user.password},function(err,data){
        if(err)throw err;
        //if find a user
        if(data.length>0){
            //send use name info back to client
            res.json({user:data[0].name});
        }else{
            //if not, send an empty string as user.
            res.json({user:''});
        }
    })
})
//retrieve the product list information
app.get('/productList',function(req,res){
    var mongodbObj = new mongodbModel('mobile','products');
    mongodbObj.init();
    //retrieve all products data
    mongodbObj.find({},function(err,data){
        if(err)throw err;
        //send data back to front page
        res.json(data);
    })
})
//retrieve single product infomation
app.post('/findProduct',function(req,res){
    //receive product id info through ajax
    var product_id = req.body.id;
    var mongodbObj = new mongodbModel('mobile','products');
    mongodbObj.init();
    //find the product by it's id
    mongodbObj.find({id:parseInt(product_id)},function(err,data){
        if(err)throw err;
        res.json(data);
    })
})
//retrieve coupon list data
app.get('/couponList',function(req,res){
    var mongodbObj = new mongodbModel('mobile','coupons');
    mongodbObj.init();
    //retrieve all coupon data
    mongodbObj.find({},function(err,data){
        if(err)throw err;
        res.json(data);
    })
})

app.post('/getVapidKey',(req,res)=>{
    var user = req.body.user;
    var mongodbObj = new mongodbModel('mobile','users');
    mongodbObj.init();
    mongodbObj.find({name:user},function(err,data){
        if(err)throw err;
        //console.log(data[0].keys[0]);
        if(data[0].keys){
            res.json({publicKey:data[0].keys[0]});
            webpush.setVapidDetails('mailto:'+data[0].email,data[0].keys[0],data[0].keys[1]);
        }else{
            //if there are not keys data, generate vapidKeys
            var vapidKeys = webpush.generateVAPIDKeys();
            var publicKey = vapidKeys.publicKey;
            var privateKey = vapidKeys.privateKey;
            //insert two keys into database for the user
            mongodbObj.insertKey({name:user},{keys:[publicKey,privateKey]},(err,result)=>{
               if(err) throw err;
                console.log("inserted keys");                
            })
            //send public key back to the client for subscription
            res.json({publicKey:publicKey});
            webpush.setVapidDetails('mailto:'+data[0].email,publicKey,privateKey);
        }
    })
    
})

//subscribe route
app.post('/subscribe',(req,res)=>{
    //get pushSubscription subject
    const subscription = req.body;
    //console.log(subscription);
    //send 201 - resource created;
    res.status(201).json({});
    //create payload
    const payload = JSON.stringify({title:'Thank you for your subscription',msg:'Check for latest deals'});
    //pass object into sendNotification
    webpush.sendNotification(subscription,payload).catch(err=>console.log(err));
});



server.listen(8000,function(){
    console.log('server is listen to 8000');
})