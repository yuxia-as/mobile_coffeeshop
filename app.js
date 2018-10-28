  
  //for saving order data
  var orderArr=[];
  //for saving selected coupon data and filter out repeated coupon data
  var couponArr=[];

  //use cookie to save user log in information
  function setCookie(name,value){ 
      var Days = 30; 
      var exp = new Date(); 
      exp.setTime(exp.getTime() + Days*24*60*60*1000); 
      //cookie will be saved as "user=username"
      document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString(); 
  }

  
  //remove cookie when log out
  function deleteCookie(name,value){
    var exp = new Date();
    exp.setTime(exp.getTime()-1);
    document.cookie = name + "=" + escape(value) + ";expires="+ exp.toGMTString();
  }
//set cookie when log in, parse user name to the certain page and move to main page
function myLogin(user){
  setCookie('user',user);
  $('#username').html(user);
  $('#username2').html(user);
  $('.main').show();
  $('#homeicon').show();
}

//retrieve use name from saved cookie  
function getUserFromCookie(){
  var user;
  var arr = document.cookie.split(';');
  var reg = /^user=+/;
  arr.forEach(function(item){
    var newItem=$.trim(unescape(item));
    if(reg.test(newItem)){
      user = newItem.substr(5);      
    }
  })
  return user;
}


//load welcome page, after 3 seconds, move to sign in/sign up page or main page based on cookie
  function loadWelcome(){
    $('.welcome').show().siblings().hide();
     setTimeout(function(){
        var user = getUserFromCookie();
        console.log(user);
        $.ajax({
          url:'http://127.0.0.1:8800/checkuser',
          type:'post',
          data:{name:user},
          success:function(data){
            var datajs = JSON.parse(data);
            console.log(datajs);
            if(datajs.msg){
              $('#username').html(user);
              $('#username2').html(user);
              $('.main').show().siblings().hide();
              $('#homeicon').show();
            }else{
              $('.sign_selection').show().siblings().hide();
            }
          }
        })
        
    },5000);
  }

  $('#homeicon').hide();
  loadWelcome();
//enable the header as main page shortcut
  $('header h1 span').on('tap',function(){    
   $('.main').show().siblings().hide();
  })
//move to sign up page
  $('.sign_selection button:first-of-type').on('tap',function(){
    $('.sign_selection').hide();
    $('.sign_up').show();
  })
  //move to sign in page
  $('.sign_selection button:last-of-type').on('tap',function(){
    $('.sign_selection').hide();
    $('.sign_in').show();
  })
//sign in page with simple validation
//after submiting,save register information, save cookie, parse user name and move to main page
  $('#btnSignupSubmit').on('click',function(){
    var user = $('#name').val();
    var email = $('#email').val()
    var pwd1 = $('#pwd1').val()
    var pwd2 = $('#pwd2').val()
    //empty the message
    $('#signup_msg').html();
    //force to enter a user and email
    if(user=='' || email==''){
      $('#signup_msg').html('please enter a Name or an Email.');
      
    }else if(pwd1 != pwd2){
      $('#signup_msg').html('The passwords you entered do not match.');      
    }else{
      var newUser = {'name':user,'email':email,'password':pwd1};
      //send user info to server
      $.ajax({
        url:'http://127.0.0.1:8800/signup',
        type:'post',
        data:newUser,
        success:function(data){
          var datajs = JSON.parse(data);
          //if this user has been registered
          if(datajs.msg=="registered"){
            $('#signup_msg').html('Tis user name has been registered.');
          }else if(datajs.msg=="success"){
            //userArr.push(newUser.name);
            //register this user means data has been write into the database
            myLogin(newUser.name);
            $('.sign_up').hide();
          }else{
            //if the database went wrong
            $('#signup_msg').html('System error, please try again later.');
          }
        }
      })      
    }

  })
  //go move retrieve password page
  $('#forget').on('tap',function(){
    $('.retrieve_password').show().siblings().hide();
  })

  $('#retrievePwdThEmail').on('tap',function(){
    //get email address
    var email = $('#email_retrieve').val();
    //console.log(email);
    $.ajax({
      url:'http://127.0.0.1:8800/forget',
      type:'post',
      data:{email:email},
      success:function(data){
        //receive data as msg:true/false
        var datajs = JSON.parse(data);
        //if true, will receive an email and then can go back to sign in page
        if(datajs.msg){
          $('#retrieve_msg').html('<p>you\'ll receive your password, please go back to sign in.</p><button id="return1">Go Back to Sign In</button>');
        //if false, can re-enter the email address, or go back to sign up page
        }else{
          $('#retrieve_msg').html('<p>We don\'t have this email address in our account, please try again</p><p>or</p><button id="return2">Go Back to Sign Up</button>');
        }
        //go to sign in page
        $('#return1').on('tap',function(){
          $('.sign_in').show().siblings().hide();
        })
        //go to sign up page
        $('#return2').on('tap',function(){
          $('.sign_up').show().siblings().hide();
        })
      }
    })
  })




//sign in page with validation
//after submiting,save cookie, parse user name and move to main page
  $('#btnSigninSubmit').on('tap',function(){
    var email=$.trim($('#email_signin').val());
    var pwd = $.trim($('#pwd_signin').val());
    //send data to server and retrieve user name
    $.ajax({
      url:'http://127.0.0.1:8800/signin',
      type:'post',
      data:{email:email,password:pwd},
      success:function(data){
        var datajs = JSON.parse(data);
        //console.log(datajs);
        var user=datajs.user;
        //if find a user
        if(user){
          myLogin(user);
          $('.sign_in').hide();
        }else{
          //if do not find a user
          $('#sign_msg').html('Email or password is wrong.');
        }
      }
    })    
  })

//log out part,delete cookie, move to sign in/sign up page
  $('#myLogout').on('tap',function(){
    var user = getUserFromCookie();
    deleteCookie('user',user);
    $('.main').hide();
    $('#homeicon').hide();
    $('.sign_selection').show();
  })

//navigation part, using animation to toggle it
 var hideOn = true;
  $('#homeicon').on('tap', function(){
    if(hideOn){
      //show the nav part
      $('.btnHome').animate({left:'0'},1000);
      //hide the nav part
    }else{
      $('.btnHome').animate({left:'-80%'},1000);
    }
    hideOn = !hideOn;
    })

  function hideNav(){
    $('.btnHome').animate({left:'-80%'},1000);
    hideOn = !hideOn;
  }
 //product page by loading info from product data 
$('#product').on('tap',function(){
  hideNav();
  $.ajax({
    url:'http://127.0.0.1:8800/productList',
    type:'get',
    success:function(data){
      var datajs = JSON.parse(data);
      console.log(datajs);
      datajs.forEach(function(item){
        var html = '<li><a href="#/product/'+item.id+'"><img src="'+item.imgsrc+'" alt=""><span>'+item.product+'</span><span>'+item.price+'</span></a></li>';
        $('.product_list ul').append(html);
      })
      $('.product_list').show().siblings().hide();
    }
  })
})


//add route to every product
hxRouter.addRoute({
      'key':'product','pattern':/^product\/(?<id>\d+)\/?$/,'action':function(){
        //find selected product id
        var myid=hxRouter.getGroups(this.pattern).id;
        //get selected product data info through served by his id
        $.ajax({
          url:'http://127.0.0.1:8800/findProduct',
          type:'post',
          data:{id:myid},
          success:function(data){
           var datajs = JSON.parse(data);
           var myObj =  datajs[0];
           //pass data to html code to show single product
            var $mydiv = $('<div><img src="'+myObj.imgsrc+'" alt=""><a href="#/product"><i id="close">&times;</i></a><span>'+myObj.product+'</span><span>'+myObj.price+'</span><button id="add_product">Add</button></div>');
        
            $('.product_single').append($mydiv);
            $('.product_single').show();
            $('.product_list').hide();
            //by closing the page, this product html is removed and show the product list page
            $('#close').on('tap',function(){
              $mydiv.remove();
              $('.product_single').hide();
              $('.product_list').show();
            })
            //by adding this product to the order, the product info is pushed to orderArr
            $('#add_product').on('tap',function(){
              var addObj = {'id':myObj.id,'product':myObj.product,'price':myObj.price};
              orderArr.push(addObj);
            })
          }
        })
      }
    });
    
//coupon page by loading from coupon data
$('#coupon').on('tap',function(){
  //empty to reload the coupon section
  $('.coupon_list ul').empty();
  hideNav();
  //loop through coupon data to load coupon list

  $.ajax({
    url:'http://127.0.0.1:8800/couponList',
    type:'get',
    success:function(data){
      //receive coupon data and convert it to array
      var datajs = JSON.parse(data);
      //pass data to html
      datajs.forEach(function(item){
        var html ='<li data-id="'+item.id+'"><img src="img/couponlogo.jpg" alt=""><span>'+item.coupon+'</span><span>'+item.price+'</span><button class="addCoupon">Add</button></li>';
        $('.coupon_list ul').append(html);
      })
      $('.coupon_list').show().siblings().hide();

      //add coupon event:
      $('.addCoupon').on('tap',function(){
        //get coupon id which is a string
        var coupon_id = $(this).parent().attr('data-id');
        var myCoupon = datajs.filter(function(item){
          return coupon_id == item.id.toString();
        })
      //check the couponArr to filter out the coupon that has been selected  
        var couponSelected =  couponArr.some(function(item){
          console.log(item.id);
          return myCoupon[0].id == item.id;
        })
        //if coupon has not been selected, it would be push into the couponArr
        if(!couponSelected){
          couponArr.push(myCoupon[0]);
        }    
      })
    }
  })

})


//the folowing functions are for calculating the total and tax value

//make sure the coupon can obly be used for certain items
    function getEffectiveCoupon(){
      var coupon = couponArr.filter(function(item1){
      if(item1.coupon==""){
        return true;
      }else{
        //check the ordered product matches the selected coupon
        return (orderArr.some(function(item2){
          return item2.product == item1.coupon;
        }))
      }
    })
      return coupon;
    }
//find the certain sign '%','$' to get the discount number    
    function getNum(str,sign){
      var signIndex = str.indexOf(sign);
      var num = parseFloat(str.substring(0,signIndex));
      return num;
    }

    function takeCouponIntoTotal(str,total){
      //if the coupon is 10% off, reduce the 10% from total
      if(str.indexOf('%')>0){
        var couponNum = getNum(str,'%')/100;
        total = total*(1-couponNum);
      }else{
        //if the coupon is -1$, take 1$ off the total
        var couponNum = getNum(str,'$');
        total = total + couponNum;
      }
      return total;
    }


    function getTotal(){
      var total = 0;
      //loop through order to get a total
      orderArr.forEach(function(item){
        total += getNum(item.price,'$');
      })
      //take coupon discount off the total
      var couponEffecArr = getEffectiveCoupon();
      if(couponEffecArr.length>0){
        couponEffecArr.forEach(function(item){
          total = takeCouponIntoTotal(item.price,total);
        })
      }
      //count tax and the final total and save them into totalObj     
      var tax = (total*0.08).toFixed(2);      
      var mytotal =  (total*1.08).toFixed(2);
      var totalObj = {"tax":tax,"total":mytotal};
      return totalObj; 
    }

$('#order').on('tap',function(){
  //hide nav section and show order_detail section
  hideNav();
  $('.order_detail').show().siblings().hide();
  //if have not order anything
  if(orderArr.length==0){
    $('.order_detail').empty();
    var mydiv = $('<div>You have not order anything</div>');
    $('.order_detail').append(mydiv);
  }else{
    $('.order_detail').empty();
    var myHtml = "<table><tbody>";
    //put order list into the table
    
    orderArr.forEach(function(item){
      myHtml += '<tr data-id="'+item.id+'"><td>'+item.product+'</td><td>'+item.price+'</td><td><button class="btn_remove">Remove</button></td></tr>';
    })
    myHtml += '</tbody></table>';
    //if order has been added put coupon to the table
    var effecCouponArr = getEffectiveCoupon();
    if(effecCouponArr.length>0){
      myHtml += '<table><tbody class="coupon_table">';
      effecCouponArr.forEach(function(item){
        myHtml += '<tr><td>'+item.coupon+'</td><td>'+item.price+'</td><td></td></tr>';
      })
      myHtml += '</tbody></table>'; 
    }
    //put tax and total into the table
    var mytotal = getTotal();
    myHtml += '<table><tbody class="total_table"><tr><td>Tax</td><td>'+mytotal.tax+'$</td><td></td></tr><tr><td>Total</td><td>'+mytotal.total+'$</td><td></td></tr></tbody></table>';
    
    myHtml += '<button id="orderBtn">SUBMIT</button>';
    $('.order_detail').append(myHtml);
  }
  //remove an order, remove relavant coupons and update the total
  $('.btn_remove').on('tap',function(){
    //find the li element to remove
    $(this).parent().parent().remove();
    //update orderArr through data id
    var order_id = $(this).parent().parent().attr('data-id');
    orderArr = orderArr.filter(function(item){
      return order_id != item.id.toString();
    })
    //update effective coupons data
    var effecCouponArr = getEffectiveCoupon();
    if(effecCouponArr.length>0){  
      //update coupon table's html
      var couponHtml = '';
      effecCouponArr.forEach(function(item){
        couponHtml += '<tr><td>'+item.coupon+'</td><td>'+item.price+'</td><td></td></tr>';
      })
      $('.coupon_table').html(couponHtml); 
    }
    //update total data
    var newTotal = getTotal();
    //update total table
    totalHtml = '<tr><td>Tax</td><td>'+newTotal.tax+'$</td><td></td></tr><tr><td>Total</td><td>'+newTotal.total+'$</td><td></td></tr>'
    $('.total_table').html(totalHtml);
  })
  
})
//enable a home button as a shortcut for main page
$('#homeaddress').on('tap',function(){
  hideNav();
  $('.main').show().siblings().hide();
})

