require('dotenv').config();
const express=require("express");
const mongoose = require("mongoose");
const bodyparser=require("body-parser");
const app=express();
const session=require("express-session");
const passport=require("passport");
const passportlocalmongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const date=require(__dirname +"/date.js");
const res = require("express/lib/response");
var cookieParser = require('cookie-parser');
const findOrCreate=require("mongoose-findorcreate");

app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(cookieParser());


app.use(session({
    secret:"our little secret.",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

const periodschema={
    day:String,
    periodnumber:String,
    starttime:String,
    endtime:String,
    period:String,
    link:String
    
};

var time=date.getTime();
console.log(time);

var currentdate=date.getDate();
console.log(currentdate);
const Period=mongoose.model("period",periodschema);
const newshedulechema={
    name:String,
    college:String,
    year:String,
    section:String,
    mail:String,
    period:[periodschema]
};
const onlineclass=mongoose.model("class",newshedulechema);

mongoose.connect("mongodb://19csr044:Gokul2002@cluster0-shard-00-00.dowfo.mongodb.net:27017,cluster0-shard-00-01.dowfo.mongodb.net:27017,cluster0-shard-00-02.dowfo.mongodb.net:27017/session?ssl=true&replicaSet=atlas-108jkb-shard-0&authSource=admin&retryWrites=true&w=majority")
//mongoose.set("useCreateIndex",true);
const signupschema=new mongoose.Schema({
    mail:String,
    password:String,
    name:String,
    googleId:String,
    username:String,
    mobilenumber:Number,
    enrolled:String
});
signupschema.plugin(passportlocalmongoose);
signupschema.plugin(findOrCreate);
const usersignup=mongoose.model("usersignup",signupschema);

passport.use(usersignup.createStrategy());
passport.serializeUser(usersignup.serializeUser());
passport.deserializeUser(usersignup.deserializeUser());
passport.serializeUser(function(usersignup,done){
    done(null,usersignup._id);
});
passport.deserializeUser(function(id,done){
    usersignup.findById(id,function(err,usersignup){
        done(err,usersignup);
    });
});

//google auth
passport.use(new GoogleStrategy({
    clientID:process.env.client_id,
    clientSecret:process.env.client_secret,
    callbackURL: "http://localhost:3000/auth/google/secret",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile,cb) {
      console.log(profile._json.email);
      console.log(profile);
      var enroll="nil";
      usersignup.find({username:profile._json.email},function(err,found)
      {
          if(found.length===0)
          {
            console.log("enroll "+enroll);
          }else{
              enroll=found[0].enrolled;
              console.log("enroll "+enroll);
          }
          usersignup.findOrCreate({ name:profile._json.name,googleId: profile.id,username:profile._json.email,enrolled:enroll }, function (err, user) {
            return cb(err, user);
      });

      
    }); 
  }
));

app.get("/",function(req,res)
{
    res.render("userlogin",{});

});
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] })
  );

app.get('/auth/google/secret', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
  
    // Successful authentication, redirect home.
    console.log(req.user.username);
    res.cookie('mail',req.user.username);
    res.redirect('/class');

    
  });

app.get('/class',function(req,res)
{
    var day=date.getDay();
    console.log(day);
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
       
        usersignup.find({username:req.cookies.mail},function(err,founds)
        {
            console.log(founds);

    
        var id=founds[0]._id;
        var enroll=founds[0].enrolled;
       console.log(enroll);
      //  res.render("secret",{});
          //Cookies that have not been signed
  console.log('Cookies: ', req.cookies);
  console.log('Cookies: ', req.cookies.mail);
//login
if(enroll==="nil"){
    res.render("enroll",{userid:id});
}else{
    onlineclass.find({_id:enroll},function(err,founddetail)
    {

        var found=founddetail[0].period;
        // found.forEach(function(name)
        // {
        //     console.log(name.day);

        // });
       console.log(founddetail.period);
    res.render("showclass",{classdetails:founddetail,perioddetail:found,today:day,mail:req.cookies.mail});
   
    
    });
    
}



});
}else{
        // res.render("secret",{});
    res.redirect("/");
    }
});
app.post("/signup",function(req,res)
{
    usersignup.register({username:req.body.mailid,name:req.body.username,mobilenumber:req.body.mobilenumber,enrolled:"nil"},req.body.password,function(err,user)
    {
        if(err)
        {
            console.log(err);

        }else{
            // passport.authenticate("local")(req,res,function(){
            //     res.redirect("/secret");
            // });
            res.redirect("/");

        }

    });

});
app.get("/auth",passport.authenticate("local", { failureRedirect: "/class", failureMessage: true }),
  function(req, res) {

    res.redirect('/class');
  });

app.post("/login",function(req1,res1)
{
    const user=new usersignup({
        username:req1.body.mail,
        password:req1.body.password
    });
    req1.login(user,function(err)
    {
        if(err)
        {
            console.log(err);
        }else{
          res1.cookie('mail',req1.body.mail);
          res1.redirect("/auth");
//            passport.authenticate('local', { failureRedirect: '/secret', failureMessage: true })(req1,res1,function() {      
//     res1.redirect('/secret');
//   });
}
});
});

app.get("/logout",function(req,res)
{
    req.logout();
    res.redirect("/");

});



const adminsignupschema={
    name:String,
    mail:String,
    mobilenumber:Number,
    password:String,
    enrolled:String
};
const adminsignup=mongoose.model("adminsignup",adminsignupschema);



app.get("/adminlogin",function(req,res)
{
    res.render("adminlogin",{});

});
app.post("/adminsignup",function(req,res)
{
    const username=req.body.username;
    const password=req.body.password;
    const mail=req.body.mailid;
    const mobilenumber=req.body.mobilenumber;
   // console.log(username+" "+password+""+mail+""+mobilenumber);
    
    const adminsignup1=new adminsignup({
        name:username,
        mail:mail,
        mobilenumber:mobilenumber,
        password:password,
        enrolled:"nil"

    });
    adminsignup.find({mail:mail},function(err,found)
    {
        if(found.length===0)
        {
            adminsignup1.save();
            res.redirect("/adminlogin");
        }else{
            res.render("error",{error:"User Already Exist! Use New Mail Id"});
        }


    });



});
app.post("/adminsignin",function(req,res)
{
    const mail=req.body.mail;
     const password=req.body.password;
    console.log(mail);
    console.log(password);
    adminsignup.find({mail:mail},function(err,found)
    {
       //console.log(err);
      if(found.length===0)
      {
        res.render("error",{error:"User Not Found?Sign Up"});
      }
      else{
          var orgpassword=found[0].password;
          var id=found[0]._id;
          var enroll=found[0].enrolled;
         console.log(enroll);
        if(orgpassword===password)
        {
            if(enroll==="nil"){
                res.render("admin",{detail:found});
            }else{
                onlineclass.find({mail:mail},function(err,foundlist)
                {
                    res.render("adminmain",{detail:foundlist});
                   
                });

             
            }

           
        }
        else{
            res.render("error",{error:"Password Wrong"});
        }
      }
      

    });
  

});

app.get("/adminadd",function(req,res)
{
    res.render("admin",{});

});
app.post("/adminupdate",function(req,res)
{
    const mail=req.body.mail;

    const days1=req.body.day1;
    const periodnumber=req.body.class;
    const starttime=req.body.starttime;
    const endtime=req.body.endtime;
    const period1=req.body.class1;
    const link1=req.body.link1;
   console.log(days1+" "+periodnumber+" "+starttime+" "+endtime+" "+period1+" "+link1);
    const day1=new Period({
        day:days1,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period1,
        link:link1
    
    });
    const days2=req.body.day2;
    const period2=req.body.class2;
    const link2=req.body.link2;
    const day2=new Period({
        day:days2,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period2,
        link:link2
    
    });
    const days3=req.body.day3;
    const period3=req.body.class3;
    const link3=req.body.link3;
    const day3=new Period({
        day:days3,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period3,
        link:link3
    
    });
    const days4=req.body.day4;
    const period4=req.body.class4;
    const link4=req.body.link4;
    const day4=new Period({
        day:days4,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period4,
        link:link4
    
    });
    const days5=req.body.day5;
    const period5=req.body.class5;
    const link5=req.body.link5;
    const day5=new Period({
        day:days5,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period5,
        link:link5
    
    });
    const days6=req.body.day6;
    const period6=req.body.class6;
    const link6=req.body.link6;
    const day6=new Period({
        day:days6,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period6,
        link:link6
    
    });
   // defaultperiod=[day1,day2,day3,day4,day5,day6];
    onlineclass.find({mail:mail},function(err,foundlist)
    {
       foundlist[0].period.push(day1,day2,day3,day4,day5,day6);
       foundlist[0].save();
       if(!err)
       {
           console.log(foundlist);
           res.render("adminmain",{detail:foundlist});
       }

       
    });
    

});
app.post("/adminadd",function(req,res)
{

    const mail=req.body.mail;
    const name=req.body.name;
    const college=req.body.clgname;
    const year=req.body.year;
    const section=req.body.section;
    const days1=req.body.day1;
    const periodnumber=req.body.class;
    const starttime=req.body.starttime;
    const endtime=req.body.endtime;
    const period1=req.body.class1;
    const link1=req.body.link1;
   console.log(days1+" "+periodnumber+" "+starttime+" "+endtime+" "+period1+" "+link1);
    const day1=new Period({
        day:days1,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period1,
        link:link1
    
    });
    const days2=req.body.day2;
    const period2=req.body.class2;
    const link2=req.body.link2;
    const day2=new Period({
        day:days2,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period2,
        link:link2
    
    });
    const days3=req.body.day3;
    const period3=req.body.class3;
    const link3=req.body.link3;
    const day3=new Period({
        day:days3,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period3,
        link:link3
    
    });
    const days4=req.body.day4;
    const period4=req.body.class4;
    const link4=req.body.link4;
    const day4=new Period({
        day:days4,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period4,
        link:link4
    
    });
    const days5=req.body.day5;
    const period5=req.body.class5;
    const link5=req.body.link5;
    const day5=new Period({
        day:days5,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period5,
        link:link5
    
    });
    const days6=req.body.day6;
    const period6=req.body.class6;
    const link6=req.body.link6;
    const day6=new Period({
        day:days6,
        periodnumber:periodnumber,
        starttime:starttime,
        endtime:endtime,
        period:period6,
        link:link6
    
    });
    defaultperiod=[day1,day2,day3,day4,day5,day6];
    const college1=new onlineclass({
        name:name,
        college:college,
        year:year,
        section:section,
        mail:mail,
        period:defaultperiod
    });
    
onlineclass.insertMany(college1,function(err)
{

    if(err)
    {

    }
    else{
        onlineclass.find({mail:mail},function(err,found)
     {
    var _id=found[0]._id;
    console.log(_id);
    adminsignup.updateOne({mail:mail},{enrolled:_id},function(err)
    {
        res.render("adminmain",{detail:found});


    });

     });
    }
});


});

app.get("/enroll",function(req,res)
{
    res.render("enroll",{});

});
app.post("/addclass",function(req,res)
{
    var day=date.getDay();
        console.log(day);
    const code=req.body.joincode;
    const id=req.body.id;
    console.log(code+" "+id);
    onlineclass.find({_id:code},function(err,founddetail)
    {
        console.log(founddetail);
      //  console.log(err);
        if(err)
        {
            console.log("class not available");
            res.render("enroll",{userid:id});

        }else{
            usersignup.updateOne({_id:id},{enrolled:code},function(err)
            {
                if(err)
                {
                    console.log(err);
                }
                usersignup.find({_id:id},function(err,found)
                {
                    const mailid=found[0].mail;
                    res.render("showclass",{classdetails:founddetail,perioddetail:founddetail[0].period,today:day,mail:mailid});

                });
               
        
            });
        
        }

    });
  
});
app.post("/showclass",function(req,res)
{
    var RailWayTime=date.getRailwayTime();
    console.log(RailWayTime);
    var day=date.getDay();
    console.log(day);
    const id=req.body.id;
    console.log(id);
     
    onlineclass.find({_id:id},function(err,founddetail)
    {

        var link="nill";
        const detail=founddetail[0].period;
        detail.forEach(function(name)
        {
            if((RailWayTime>=name.starttime && RailWayTime<name.endtime) && (name.day===day))
            {

                console.log(name.period);
                console.log(name.link);
                link=name.link;

            }
            //console.log(count);
        
        });
             if(link ==="nill")
             {
                 //console.log("class not available");
                 res.render("classerror",{error:"Class not Available At this Time"});
             } else{
               // console.log(link);
            res.redirect(link);
             }
        
    });
 
    
    
    
}); 
app.post("/updateperiod",function(req,res)
{
    const periodid=req.body.periodid;
    const classid=req.body.classid;
    console.log(periodid);
    console.log(classid);
    const val="gokul";
    onlineclass.findOneAndUpdate({_id:classid},{$pull:{period:{periodnumber:periodid}}},function(err,foundlist)
    {
       if(!err)
       {
           onlineclass.find({_id:classid},function(err,found)
           {
            console.log(foundlist);
            res.render("adminmain",{detail:found});
           });
        
       }

    });
});
app.post("/deleteclass",function(req,res)
{
    const deleteid=req.body.deleteid;
    const mail=req.body.mailid;
    adminsignup.updateOne({enrolled:deleteid},{enrolled:"nil"},function(err)
    {
        if(!err)
        {
            console.log("enroll nill");
        }

    });
    usersignup.updateMany({enrolled:deleteid},{enrolled:"nil"},function(err)
    {
        if(!err)
        {
            console.log("enroll nill");
        }

    });

    onlineclass.deleteOne({_id:deleteid},function(err)
    {
        if(!err)
        {
            console.log("deleted");
            

            adminsignup.find({mail:mail},function(err,found)
            {
                res.render("admin",{detail:found});

            });
        }
        

    });

});
app.post("/leaveclass",function(req,res)
{
    const mail=req.body.mail;
    console.log("leave "+mail);
    usersignup.updateOne({username:mail},{enrolled:"nil"},function(err)
    {

    });
    res.redirect("/");


});
app.listen(process.env.PORT || 3000,function()
{
    console.log("server started");

});















