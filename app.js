const express=require("express");
const mongoose = require("mongoose");
const bodyparser=require("body-parser");
const app=express();
const date=require(__dirname +"/date.js");
app.use(bodyparser.urlencoded({extended:true}));
 app.set("view engine","ejs");
mongoose.connect("mongodb://19csr044:Gokul2002@cluster0-shard-00-00.dowfo.mongodb.net:27017,cluster0-shard-00-01.dowfo.mongodb.net:27017,cluster0-shard-00-02.dowfo.mongodb.net:27017/onlineClass?ssl=true&replicaSet=atlas-108jkb-shard-0&authSource=admin&retryWrites=true&w=majority")
const periodschema={
    day:String,
    periodnumber:Number,
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
const period1=new Period({
    day:"monday",
    periodnumber:1,
    starttime:"09:00",
    endtime:"10:00",
    period:"web tech",
    link:"https://meet.google.com/wsw-irot-yzo"

});
const period2=new Period({
    day:"monday",
    periodnumber:2,
    starttime:"10:00",
    endtime:"11:00",
    period:"computer network",
    link:"https://meet.google.com/spm-xmja-hoj"

});
defaultperiod=[period1,period2];
const newshedulechema={
    name:String,
    college:String,
    year:String,
    section:String,
    period:[periodschema]
};
const onlineclass=mongoose.model("class",newshedulechema);
app.get("/",function(req,res)
{
    res.render("userlogin",{});

});
const signupschema={
    name:String,
    mail:String,
    mobilenumber:Number,
    password:String,
    enrolled:String
};
const usersignup=mongoose.model("usersignup",signupschema);
app.post("/signup",function(req,res)
{
    const username=req.body.username;
    const password=req.body.password;
    const mail=req.body.mailid;
    const mobilenumber=req.body.mobilenumber;
   // console.log(username+" "+password+""+mail+""+mobilenumber);
    
    const signup=new usersignup({
        name:username,
        mail:mail,
        mobilenumber:mobilenumber,
        password:password,
        enrolled:"nil"

    });
signup.save();
res.redirect("/");
});
app.post("/login",function(req,res)
{
    const uname=req.body.username;
     const password=req.body.password;
    console.log(uname);
    console.log(password);
    usersignup.find({name:uname},function(err,found)
    {
       console.log(err);
      if(found.length===0)
      {
          res.redirect("/");
      }
      else{
          var orgpassword=found[0].password;
          var id=found[0]._id;
          var enroll=found[0].enrolled;
         console.log(enroll);
        if(orgpassword===password)
        {
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
                res.render("showclass",{classdetails:founddetail,perioddetail:found});
               
                
                });
            }

           
        }
        else{
            res.redirect("/");
        }
      }
      

    });
  

});

app.get("/adminadd",function(req,res)
{
    


    
    const college1=new onlineclass({
        name:"gokul",
        college:"kongu engineering college",
        year:"3rd year",
        section:"A",
        period:defaultperiod
    });
college1.save();
res.send("welcome to admin");
});
app.get("/enroll",function(req,res)
{
    res.render("enroll",{});

});
app.post("/addclass",function(req,res)
{
    const code=req.body.joincode;
    const id=req.body.id;
    console.log(code+" "+id);
    onlineclass.find({_id:code},function(err,founddetail)
    {
        console.log(founddetail.length);
        console.log(err);
        if(founddetail.length===0)
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
                res.render("showclass",{classdetails:founddetail,perioddetail:founddetail[0].period});
        
            });
        
        }

    });
  
});
app.get("/showclass",function(req,res)
{
    res.send("succseefully enrolled");

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


        const detail=founddetail[0].period;
        var count=0;
        detail.forEach(function(name)
        {
            if((RailWayTime>name.starttime && RailWayTime<name.endtime) && (name.day=day))
            {

                console.log(name.period);
                console.log(name.link);
                res.redirect(name.link);

            }
            else{
                count++;
            }
         
        });
        console.log(count);
        if(count==2)
        {
            res.send("class not available");

        }

    });
    
   

}); 
app.listen(process.env.PORT || 3000,function()
{
    console.log("server started");

});








