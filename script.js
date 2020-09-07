// WebSpeech Configurations

const searchForm = document.querySelector("#search-form");
const searchFormInput = searchForm.querySelector("input");
window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("button");
  const result = document.getElementById("result");
  const main = document.getElementsByTagName("main")[0];
  let listening = false;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (typeof SpeechRecognition !== "undefined") {
    const recognition = new SpeechRecognition();

    const stop = () => {
      main.classList.remove("speaking");
      recognition.stop();
      button.textContent = "Start";
    };

    const start = () => {
      main.classList.add("speaking"); 
      recognition.start();
      button.textContent = "Stop";
    };
    
    const onResult = event => {
      const curr = event.resultIndex;
      const transcript = event.results[curr][0].transcript;
      searchFormInput.value = transcript;
    };
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.addEventListener("result", onResult);
    button.addEventListener("click", event => {
      listening ? stop() : start();
      listening = !listening;
    });
  } else {
    button.remove();
    const message = document.getElementById("message");
    message.removeAttribute("hidden");
    message.setAttribute("aria-hidden", "false");
  }
});

//base HTML connections

//###########################################################                 DONT mess with this part

function handleInput(input) {
  var input = document.forms["myForm"]["input"].value;
  document.forms["myForm"]["input"].value = "";
  if (input == "") {
    return;
  }

  // setReply("...");
  // setJsonData("...");
  sendRequestToWit(input).then(data => {
    // setJsonData(data);
    handleWitReply(data);
  });
}



function setReply(str) {
  document.getElementById("reply").innerHTML = str;
  let utterance = new SpeechSynthesisUtterance(str);
  speechSynthesis.speak(utterance);
}
function ListUniversities(){
  var ul = document.getElementById("uni_list");
  var li = document.createElement("li");
  for(var i=0;i<dataset.length;i++){
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(dataset[i][0]));
    ul.appendChild(li);
  }
}


// Whoa a life form? I never thought a human will read my code :()

//DEBUG
// function setJsonData(data) {
//   document.getElementById("data").innerHTML =
//     "<pre>" + JSON.stringify(data, null, 4) + "</pre>";
// }

// Wit.ai connections

function sendRequestToWit(data) {
  const url = "https://api.wit.ai/message?q=";
  const params = {
    headers: {
      Authorization: "Bearer WB2W3C3J5YPVEAOA324DAMUGQL4XBO45"
    }
  };

  var fullRequest = url + data;
  return fetch(fullRequest, params).then(response => response.json());
}

//######################################################################## dont mess with above code


// $("#myinput").keypress(function(event) { 
//   if (event.keyCode === 13) { 
//       $("#myButt").click(); 
//       handleInput();
//   } 
// }); 


var myPix = ["Counselors/doggo1.jpg","Counselors/doggo2.jpg", "Counselors/doggo3.jpg","Counselors/doggo4.jpg","Counselors/doggo5.jpg","Counselors/not-doggo.jpg"];
function choosePic(){
  var randomNum = Math.floor(Math.random() * myPix.length);
  document.getElementById("avatar").src = myPix[randomNum];
}
window.onload=function(){
  choosePic();
  checkCookie();
  }
  var dataset = [];
  var begin = false;
  DataGenerator();
  const options = {
    includeScore:true
   }


  // const info = document.querySelector(".info");
  // var askables = ["Is <University Name> an ivy league?","Is sat required for <University Name>? ","when is the application due for <University Name>?","what GPA do I need to go to <University Name>?","Average SAT score for <University Name>?"];
  // info.textContent = 'Ask me something like: '+askables[Math.floor(Math.random() * (askables.length))];

//Data export from csv file
  function DataGenerator(){
    d3.csv("Cdata.csv").then(function(Data){
      for(var i = 0;i<Data.length;i++){
        dataset[i] = [Data[i].College,Data[i].Acronym,Data[i].Type,Data[i].Acc_Rate,Data[i].Fee,Data[i].international,Data[i].out_of_state,Data[i].in_state,Data[i].Students,Data[i].Sem_Quarter,Data[i].Min_GPA,Data[i].RANK,Data[i].Location,Data[i].SAT,Data[i].AVG_SAT,Data[i].ACT,Data[i].AVG_ACT,Data[i].LOR,Data[i].App_Due_Date];
      }
  });
}

//An ode to Free Online blogs and StackOverflow!!! 

//main function:
function handleWitReply(data) {
  if (data.intents.length == 0) {
    NotInList(data);
    return;
  }
  make_history(data.text);
  switch (data.intents[0].name) {
    case "Query":
      if(search_entity(data,"collegetype")){
        UniType(data);
      }
      else if(search_entity(data,"metric")){
        handleMetric(data);
      }
      else if(search_entity(data,"Cost")){
        handleFee(data);
      }
      else if (search_entity(data,"CollegeInfo")){
      handleCollegeQuery(data);}
      break
    case "Greetings":
      ReplyToGreetings(data);
      break
    default:
      NotInList(data);
  }
}

//gives whether ivy/private/public {fuzzystring incorporated}
function UniType(data){
  // console.log('trigged UniType');  debug
  let present = false;
  const name = extractUniName(data);
  if(name == 'false'){
    setReply(`Not in list`);
  }
  const res = GiveEntryFromName(name);
  if(res!=-1){
    setReply(`${name} is ${res[2]} University`);
  }
}

function handleMetric(data){
  const res = data.entities["metric:metric"][0].value;
  // const str_body = data.entities["metric:metric"][0].body;
  // var res = str.split(" "); 
  const name = extractUniName(data);
  if(name == 'false'){
    setReply(`Not in list`);  //Todo: write a better exit point
    return;
  }
  const vals = GiveEntryFromName(name);
  let command = res.toLowerCase();
  // console.log(command);
  if(command == 'average_gpa'){
    setReply(`${name} requires around ${vals[10]} GPA`);
    
  }
  else if(command == 'acceptance rate'){
    setReply(`${name} takes in about ${vals[3]}% people who apply`);
    
  }
  else if(command == "average_act"){
    setReply(`For ${name}, the Average ACT score is ${vals[16]}`);
    
  }
  else if(command == "average_sat"){
    setReply(`For ${name}, the Average SAT score is ${vals[14]}`);
  }
  else if(command == "sat_required"){
    setReply(`For ${name}, SAT is ${vals[13]}`);
  }
  else if(command == "act required" ){
    setReply(`For ${name}, ACT is ${vals[15]}`);
  }
}

//Whoa you came till here? thanks dude!


function handleFee(data){
  const name = extractUniName(data);
  // console.log("I'm in handleFee");
  if(name == 'false'){
    setReply(`Not in list`);  //Todo: write a better exit point
    return;
  }
  const vals = GiveEntryFromName(name);
  // console.log(name,vals);
  if(vals[4] !=""){
    setReply(`It costs $${vals[4]} to attend ${name}`);
  }
  else{
    let s1 = vals[5],s2 = vals[6],s3 = vals[7];
    
    let str = "International = "+ s1+ " </br> Out Of State = "+s2+"  </br>  In state  = "+s3;
    setReply(`${str}`); 
  }
}

function handleCollegeQuery(data){
  // console.log('triggered handleCollegeQuery');
  const name = extractUniName(data);
  if(name == 'false'){
    setReply(`Not in list`);  //Todo: write a better exit point
    return;
  }
  const vals = GiveEntryFromName(name);
  const command = data.entities["CollegeInfo:CollegeInfo"][0].value;
  if(command == 'App_Due_Date'){
    setReply(`The application due date for ${name} is ${vals[18]}.`)
  }
  else if(command == 'NumberStudents'){
    setReply(`The ${name} has about ${vals[8]} students.`)
  }
  else if(command == 'Term'){
    setReply(`${name} has ${vals[9]}`);
  }
  else if(command == 'Rank'){
    setReply(`${name} is ranked ${vals[11]} in the global rankings.`);
  }
  else if(command == 'Location'){
    setReply(`${name} is located in ${vals[12]}`);
  }
}


function ReplyToGreetings(data){
  // console.log('triggered reply2greetings'); debug
  if(!begin){
  setReply(`Hello! How can I help you today?`);
  begin = true;
  }
  else{
    setReply('Hello! Was I able to solve your last query?');
  }
}

//utility functions

function getCol(matrix, col){
 var column = [];
 for(var i=0; i<matrix.length; i++){
    column.push(matrix[i][col]);
 }
 return column;
}
//checks whether the given key matches the entity
function search_entity(data,key){
const search_k = key+':'+key;
// console.log('in func search entity'); debug
for(const entity in data.entities){
  if(entity == search_k){
    return true;
  }
}
return false;
}

function extractUniName(data){
  const uni = data.entities["Uni_Name:Uni_Name"][0].value;
  const fuse = new Fuse(getCol(dataset,0),options);
  const result = fuse.search(uni);
  // console.log(result);
  if(result[0].score<0.6){
    return result[0].item;
  }
  else{
    return 'false';
  }
}

function GiveEntryFromName(name){
  for(var i =0;i<dataset.length;i++){
    if(dataset[i][0] == name){
      return dataset[i];
    }
  }
  return -1;
}

function prettyList(data) {
  if (data.length > 1) {
    data.push(data[data.length - 1]);
    data[data.length - 2] = "and";
  }
  var res = "";
  data.forEach(function(item) {
    res += item + " ";
  });
  return res.trim();
}

//You deserve brownie points :)
//By yours truely, Aneesh Chawla :Ds

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var username = getCookie("username");
  if (username != "") {
    welcomeAgain(username);
  //  alert("Welcome again " + username);
  } else {
    username = prompt("Please enter your name:", "");
    if (username != "" && username != null) {
      setCookie("username", username, 365);
      Introduction(username);
    }
  }
}

function welcomeAgain(username){
  const msg = "It's nice to see you again "+username+"."+" Lets get back on working on that College Application, shall we?";
  document.getElementById("reply").innerHTML = msg;
  let utterance = new SpeechSynthesisUtterance(msg);
  speechSynthesis.speak(utterance);
}
var count = 0;
function make_history(query) {
  var ul = document.getElementById("list");
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(query));
  ul.appendChild(li);
  count++;
  if(count>=10){
    ul.removeChild(ul.firstChild);
  }
}


function Introduction(username){
  const names = ["Charlie"
                  ,"Max"
                  ,"Buddy"
                  ,"Oscar"
                  ,"Milo"
                  ,"Archie"
                  ,"Ollie"
                  ,"Toby"
                  ,"Jack"
                  ,"Teddy"];
  const msg = "Hey There "+username+"! I am "+ names[Math.floor(Math.random() * (names.length))]+" and I'll be helping you with your college application!";
  document.getElementById("reply").innerHTML = msg;
  let utterance = new SpeechSynthesisUtterance(msg);
  speechSynthesis.speak(utterance);
}


//Yeah this is the shittiest part >>

function RunSuggestion1() 
{
    const text =  document.getElementById("b1").textContent;
    searchFormInput.value = text;
    handleInput(text);       
}
function RunSuggestion2() 
{
    const text =  document.getElementById("b2").textContent;
    searchFormInput.value = text;
    handleInput(text);    
}
function RunSuggestion3() 
{
    const text =  document.getElementById("b3").textContent;
    searchFormInput.value = text;
    handleInput(text);    
}
function RunSuggestion4() 
{
    const text =  document.getElementById("b4").textContent;
    searchFormInput.value = text;
    handleInput(text);    
}
function RunSuggestion5() 
{
    const text =  document.getElementById("b5").textContent;
    searchFormInput.value = text;
    handleInput(text);        
}
function RunSuggestion6() 
{
    const text =  document.getElementById("b6").textContent;
    searchFormInput.value = text;
    handleInput(text);    
}
function RunSuggestion7() 
{
    const text =  document.getElementById("b7").textContent;
    searchFormInput.value = text;
    handleInput(text);    
}
function RunSuggestion8() 
{
    const text =  document.getElementById("b8").textContent;
    searchFormInput.value = text;   
    handleInput(text);    
}
function RunSuggestion9() 
{
    const text =  document.getElementById("b9").textContent;
    searchFormInput.value = text;
    handleInput(text);    
}

function NotInList(data) {
  setReply(`Sorry, we're currently under construction`);
    //todo
}

