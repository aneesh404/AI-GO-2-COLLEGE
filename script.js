//base HTML connections

//###########################################################dont mess with this part

function handleInput(input) {
    var input = document.forms["myForm"]["input"].value;
    document.forms["myForm"]["input"].value = "";
    if (input == "") {
      return;
    }
  
    setReply("...");
    setJsonData("...");
    sendRequestToWit(input).then(data => {
      setJsonData(data);
      handleWitReply(data);
    });
  }
  
  function setReply(str) {
    document.getElementById("reply").innerHTML = str;
  }
  
  function setJsonData(data) {
    document.getElementById("data").innerHTML =
      "<pre>" + JSON.stringify(data, null, 4) + "</pre>";
  }
  
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
        else{
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
    const str = data.entities["metric:metric"][0].value;
    var res = str.split(" "); 
    const name = extractUniName(data);
    if(name == 'false'){
      setReply(`Not in list`);
    }
    const vals = GiveEntryFromName(name);
    for(var i =0;i<res.length;i++){
      let command = res[i].toLowerCase();
      if(command == 'gpa'){
        setReply(`${name} requires around ${vals[10]}`);
        break;
      }
      if(command == 'acceptance'){
        setReply(`${name} takes in about ${vals[3]}% people who apply`);
        break;
      }
      if(command == "average_act"){
        setReply(`For ${name}, the Average ACT score is ${vals[17]}`);
        break;
      }
      if(command == "Average_sat"){
        setReply(`For ${name}, the Average SAT score is${vals[15]}`);
        break;
      }
      if(command == "Sat_required" ){
        setReply(`For ${name}, SAT is ${vals[13]}`);
      }
    }
  }

  function handleCollegeQuery(data){
    // console.log('triggered handleCollegeQuery'); debug
    const Uni_Name = "";
    try{
      Uni_Name = extractUniName(data);
      }catch(err){
        NotInList(data);
      }
    if(Uni_Name.length!=1){
      return NotInList();
    }
  }
  
  function ReplyToGreetings(data){
    // console.log('triggered reply2greetings'); debug
    setReply(`Hello! How can I help you today?`);
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
  // console.log(search_k);
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
  
  
// function titleCase(string) {
//     var sentence = string.toLowerCase().split(" ");
//     for(var i = 0; i< sentence.length; i++){
//        sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
//     }
//  document.write(sentence.join(" "));
//  return sentence;
//  }