//console.log(module);
module.exports.getDate=getDate; 

function getDate()
{
    var today=new Date();
    var currdate=today.getDay();
  //  console.log(currdate);
    var days=["sunday","monday","tuesday","wednesday","friday","saturday"];
    var day="";
    var options ={
        weekday:"long",
        day:"numeric",
        month:"long"

    };
    day=today.toLocaleDateString("en-In",options);
    return day;

}
module.exports.getDay=getDay; 
function getDay()
{
    var today=new Date();
    var currdate=today.getDay();
   // console.log(currdate);
    var days=["sunday","monday","tuesday","wednesday","friday","saturday"];
    var day="";
    var options ={
        weekday:"long"

    };
    day=today.toLocaleDateString("en-In",options);
    return day;

}   
module.exports.getTime=getTime; 
function getTime()
{
    var today=new Date();
    var currdate=today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   // console.log(currdate);
  
    return currdate;

}   
module.exports.getRailwayTime=getRailwayTime; 
function getRailwayTime()
{
    var today=new Date();
    var currdate=today.toLocaleTimeString("en-In", {hour12:false, hour: '2-digit', minute: '2-digit' });
   console.log(currdate);
// var dateUTC = new Date();
// var dateUTC = dateUTC.getTime() 


// var dateIST = new Date();
// //date shifting for IST timezone (+5 hours and 30 minutes)
// dateIST.setHours(dateIST.getHours() + 5); 
// dateIST.setMinutes(dateIST.getMinutes() + 30);
// var currdate=dateIST.toLocaleTimeString([], {hour12:false, hour: '2-digit', minute: '2-digit' });
return currdate;

}   