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
      button.textContent = "Start listening";
    };

    const start = () => {
      main.classList.add("speaking");
      recognition.start();
      button.textContent = "Stop listening";
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

//###########################################################dont mess with this part

function handleInput(input) {
  var input = document.forms["myForm"]["input"].value;
  document.forms["myForm"]["input"].value = "";
  if (input == "") {
    return;
  }

  setReply("...");
  // setJsonData("...");
  sendRequestToWit(input).then(data => {
    // setJsonData(data);
    handleWitReply(data);
  });
}

function setReply(str) {
  document.getElementById("reply").innerHTML = str;
}

// function setJsonData(data) {
//   document.getElementById("data").innerHTML =
//     "<pre>" + JSON.stringify(data, null, 4) + "</pre>";
// }

// Wit.ai connections

function sendRequestToWit(data) {
  const url = "https://api.wit.ai/message?q=";
  const params = {
    headers: {
      Authorization: "Bearer WT2HXX7H7SMLTXPPRV3MUSMTDCYTY6PG"
    }
  };

  var fullRequest = url + data;
  return fetch(fullRequest, params).then(response => response.json());
}

//######################################################################## dont mess with above code

  var dataset = [];
  var begin = false;
  DataGenerator();
  const options = {
    includeScore:true
   }

//Data export from csv file
  function DataGenerator(){
    d3.csv("Cdata.csv").then(function(Data){
      for(var i = 0;i<Data.length;i++){
        dataset[i] = [Data[i].College,Data[i].Acronym,Data[i].Type,Data[i].Acc_Rate,Data[i].Fee,Data[i].international,Data[i].out_of_state,Data[i].in_state,Data[i].Students,Data[i].Sem_Quarter,Data[i].Min_GPA,Data[i].RANK,Data[i].Location,Data[i].SAT,Data[i].AVG_SAT,Data[i].ACT,Data[i].AVG_ACT,Data[i].LOR,Data[i].App_Due_Date];
      }
  });
}


//main function:
function handleWitReply(data) {
  if (data.intents.length == 0) {
    NotInList(data);
    return;
  }
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
    setReply(`${name} is ${res[2]} type`);
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
  // for(var i =0;i<res.length;i++){
  let command = res.toLowerCase();
  console.log(command);
  if(command == 'gpa required'){
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
  else if(command == "sat required" ){
    setReply(`For ${name}, SAT is ${vals[13]}`);
  }
  else if(command == "act required" ){
    setReply(`For ${name}, SAT is ${vals[15]}`);
  }
}
function handleFee(data){
  const name = extractUniName(data);
  console.log("I'm in handleFee");
  if(name == 'false'){
    setReply(`Not in list`);  //Todo: write a better exit point
    return;
  }
  const vals = GiveEntryFromName(name);
  console.log(name,vals);
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
  console.log('triggered handleCollegeQuery');
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
  else if(command == 'Semester'){
    setReply(`${name} has ${vals[9]}`);
  }
  else if(command == 'Rank'){
    setReply(`${name} is ranked ${vals[11]} in the global ranking.`);
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
  // var ents = data.entities["Uni_Name:Uni_Name"];
  // ents.forEach(function(entity){
  //   res.push(entity.value);
  // });
  // return res;
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
function NotInList(data) {
  return 0;
    //todo
}