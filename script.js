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
  
  function isUniName(data){
    return data.entities.name == "Uni_Name";
  }
  
  
  
  function UniType(data){
    for(var i = 0;i<dataset.length;i++){
      if(extractUniName(data) == dataset[i][0]){
        setReply(`${dataset[i][0]} is a ${dataset[i][2]}`);
      }
    }
  }
  
  function findUni(uni){
      for(var i = 0;i<dataset.length;i++){
        if(uni == dataset[i][0]){
          return true;}
        console.log(`${dataset[i][0]}`);
      }
    return false;
  }
  
  function handleWitReply(data) {
    if (data.intents.length == 0) {
      NotInList(data);
      return;
    }
    switch (data.intents[0].name) {
      case "Query":
        handleCollegeQuery(data);
        break
      case "Greetings":
        ReplyToGreetings(data);
        break
      default:
        NotInList(data);
    }
  }
  
  
  function NotInList(data) {
    if(isUniName(data)){
      setReply(`Currently we only have the following universities in our dataset`);
    }
    else{
      setReply(`I can't comprehend what you just said.`)
    }
  }
  
  function DataGenerator(){
      d3.csv("Cdata.csv").then(function(Data){
        for(var i = 0;i<Data.length;i++){
          dataset[i] = [Data[i].College,Data[i].Acronym,Data[i].Type,Data[i].Acc_Rate,Data[i].Fee,Data[i].international,Data[i].out_of_state,Data[i].in_state,Data[i].Students,Data[i].Sem_Quarter,Data[i].Min_GPA,Data[i].RANK,Data[i].Location,Data[i].SAT,Data[i].AVG_SAT,Data[i].ACT,Data[i].AVG_ACT,Data[i].LOR,Data[i].App_Due_Date];
        }
    });
  }
  
  function ReplyToGreetings(data){
    setReply(`Hello! How can I help you today?`);
  }
  
  
  function handleCollegeQuery(data){
    var Uni_Name = [];
    try{
      Uni_Name = extractUniName(data);
      }catch(err){
        NotInList(data);
      }
    if(Uni_Name.length!=1){
      return NotInList();
    }
    var invalid = false;
    Uni_Name.forEach(function(uni){
      if(!findUni(uni)){
        
        console.log(`Not in the list = ${uni}`);
        setReply(`Currently we dont have ${uni} . We're working on adding more universities to the list.`);
        invalid = true;
      }
    });
  
    if (invalid) {
      return;
    }
    else{
    setReply(`We got your query and working to get the results...`);
    }
  }
  
  
  function extractUniName(data){
    var res = [];
    var ents = data.entities["Uni_Name:Uni_Name"];
    ents.forEach(function(entity){
      res.push(entity.value);
    });
    return res;
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
  