// thedogapi.com
const path = "https://api.thedogapi.com/v1/";
const api_key = "api_key=2d94f819-5952-49dc-9c56-af2519e22187";

// card limit per page
const limit = 10

// HTML Element
var dataSection = document.getElementById("data-list")
var statusSection = document.getElementById("status-info")
var searchBox = document.getElementById('searchText');

// Get data from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Autocomplete
// https://github.com/gch1p/bootstrap-5-autocomplete
var listTemperament = []
var listName = []
var listBreedGroup = []
const ac = new Autocomplete(searchBox, {
  maximumItems: 10,
  treshold: 1
});
autocompleteList()
ac.setData(listName)

// Category options event
// 1. Change placeholder for each category
// 2. Change data for autocomplete
var category = document.getElementById("categorySearch")
category.addEventListener("change", function(){
  if(category.value == "temperament"){
    searchBox.setAttribute("placeholder", "Temperament")
    ac.setData(listTemperament)
  }else if(category.value == "breedGroup"){
    searchBox.setAttribute("placeholder", "Breed Group")
    ac.setData(listBreedGroup)
  }else if(category.value == "maxHeight"){
    searchBox.setAttribute("placeholder", "Maximum Height in CM")
    ac.setData([])
  }else if(category.value == "minHeight"){
    searchBox.setAttribute("placeholder", "Minimum Height in CM")
    ac.setData([])
  }else if(category.value == "maxWeight"){
    searchBox.setAttribute("placeholder", "Maximum Weight in KG")
    ac.setData([])
  }else if(category.value == "minWeight"){
    searchBox.setAttribute("placeholder", "Minimum Weight in KG")
    ac.setData([])
  }else{
    searchBox.setAttribute("placeholder", "Name")
    ac.setData(listName)
  }  
})

// Choosing default page or search page
// 1. Check if there is "search" data on url
// 2. If "search" data exist, checking "category" data and do method accordingly
// 3. if "search" data doesn't exist, checking "page" data and do method accordingly
if (urlParams.has("search")) {
  var search = urlParams.get("search")
  var options = urlParams.get("category")
  if (options =="name") {
    statusSection.innerHTML = `Search dog(s) with ${options}: "${search}"`
    searchBreed(search)
  }else if (options=="temperament") {
    statusSection.innerHTML = `Search dog(s) with ${options}: "${search}"`
    searchInfo(search, "temperament")
  }else if (options=="breedGroup") {
    statusSection.innerHTML = `Search dog(s) with breed group: "${search}"`
    searchInfo(search, "breed_group")
  }else if (options=="maxHeight") {
    statusSection.innerHTML = `Search dog(s) with maximum height: ${search} cm`
    searchBiometric(search, "height","max")
  }else if (options=="minHeight") {
    statusSection.innerHTML = `Search dog(s) with minimum height: ${search} cm`
    searchBiometric(search, "height","min")
  }else if (options=="maxWeight") {
    statusSection.innerHTML = `Search dog(s) with maximum weight: ${search} kg`
    searchBiometric(search, "weight","max")
  }else if (options=="minWeight") {
    statusSection.innerHTML = `Search dog(s) with minimum weight: ${search} kg`
    searchBiometric(search, "weight","min")
  }
}else{
  var page = urlParams.has("page") ? urlParams.get("page") : 1;
  breedList(page);
}

//get JSON
async function getData(path){
  const response = await fetch(path);
  const data = await response.json();
  return data;
}

// Get all dog's name, temperament, and breed group
function autocompleteList(){
  // 1. Get data for all dog
  // 2. Check if the name, temperament, or breed group already exists on the list
  // 3. If doesn't exists, put on the list
  // 4. Sort each list
  //https://api.thedogapi.com/v1/breeds?api_key={{API_KEY}}
  var url = path+"breeds?"+api_key
  getData(url).then(data => {
    for(var i = 0; i < data.length; i++){
      if (!listName.filter(e => e.label == data[i].name).length > 0) {
        listName.push({"label":data[i].name, "value":data[i].name})
      }
      if(data[i].hasOwnProperty("temperament")){
        data[i].temperament.split(", ").forEach(element => {
          if (!listTemperament.filter(e => e.label == element).length > 0) {
            listTemperament.push({"label":element, "value":element})
          }
        });
      }
      if(data[i].hasOwnProperty("breed_group")){
        if (!listBreedGroup.filter(e => e.label == data[i].breed_group).length > 0 && data[i].breed_group.length>0) {
          listBreedGroup.push({"label":data[i].breed_group, "value":data[i].breed_group})
        }
      }
    }
    listTemperament.sort()
    listName.sort()
    listBreedGroup.sort()
  })
}

//default list
function breedList(page){
  // 1. Get data with limit and page
  // 2. Show data with card
  // 3. Do method to make pagination
  //https://api.thedogapi.com/v1/breeds?api_key={{API_KEY}}
  var url = path+"breeds?"+api_key
  //https://api.thedogapi.com/v1/breeds?api_key={{API_KEY}}&limit={{LIMIT}}&page={{PAGE}}
  var url_page = url+"&limit="+limit+"&page="+(page-1)+"&order=Asc"
  getData(url_page).then(response=>{
    if(response.length<1){
      dataSection.insertAdjacentHTML("beforeend","<p class='fs-4 text-white text-center'>No Data Available</p>")
    }
    else{
      for(i=0;i<response.length;i++){
        var data = {
          id:response[i].id,
          imageUrl:response[i].image.url,
          name:response[i].name,
          temperament:response[i].temperament
        }
        card(data);
      }
    }
    pagination(url)
  })
}

//search dog(s) by name
function searchBreed(data){
  // 1. Get data based on input
  // 2. check "reference_image_id" property
  // 3. If "reference_image_id" property does exist, show data in card
  // 4. If there is no data shown, show "No Data Available"
  //https://api.thedogapi.com/v1/breeds/search?q={{DOG_NAME}}&api_key={{API_KEY}}
  var url = path+"breeds/search?q="+data+"&"+api_key
  getData(url).then(response=>{
    for(i=0;i<response.length;i++){
      if(response[i].hasOwnProperty("reference_image_id")){
        //https://api.thedogapi.com/v1/images/{{REFERENCE_IMAGE_ID}}?api_key={{API_KEY}}
        getData(path+"images/"+response[i].reference_image_id+"?"+api_key).then(dog=>{
          var data = {
            id:dog.breeds[0].id,
            imageUrl:dog.url,
            name:dog.breeds[0].name,
            temperament:dog.breeds[0].temperament
          }
          card(data);
        })
      }
    }
    if(dataSection.innerHTML==""){
      dataSection.insertAdjacentHTML("beforeend","<p class='fs-4 text-white text-center'>No Data Available</p>")
    }
  })
}

//Search dog(s) by temperament or breed group
function searchInfo(search, option){
  // 1. Get data for all dogs
  // 2. Check if dog's data has property that we want
  // 3. If dog's has property that we want, Check if the property's value is the one that we looking for
  // 4. If the property's value is the one that we looking for, show data in card
  // 5. If there is no data shown, show "No Data Available"
  //https://api.thedogapi.com/v1/breeds?api_key={{API_KEY}}
  var url = path+"breeds?"+api_key
  search = search.toLowerCase()
  getData(url).then(response=>{
    for(i=0;i<response.length;i++){
      if(response[i].hasOwnProperty(option)){
        if(option == "temperament"){
          var info = response[i].temperament.toLowerCase()
          if(info.includes(search)){
            var data = {
              id:response[i].id,
              imageUrl:response[i].image.url,
              name:response[i].name,
              temperament:response[i].temperament
            }
            card(data);
          }
        }else if(option == "breed_group"){
          var info = response[i].breed_group.toLowerCase()
          if(info == search){
            var data = {
              id:response[i].id,
              imageUrl:response[i].image.url,
              name:response[i].name,
              temperament:response[i].temperament
            }
            card(data);
          }
        }
      }
    }
    if(dataSection.innerHTML==""){
      dataSection.insertAdjacentHTML("beforeend","<p class='fs-4 text-white text-center'>No Data Available</p>")
    }
  })
}

//Search dog(s) by biometric
function searchBiometric(search, option, range){
  // 1. Check if search parameter is not a number. If yes, show "Input is not valid"
  // 2. Get data for all dogs
  // 3. Check if dog's data has property that we want
  // 4. If dog's has property that we want, Check if the property's value is the one that we looking for
  // 5. If the property's value is the one that we looking for, show data in card
  // 6. If there is no data shown, show "No Data Available"
  //https://api.thedogapi.com/v1/breeds/search?q={{DOG_NAME}}&api_key={{API_KEY}}
  var url = path+"breeds?"+api_key
  search = parseInt(search)
  if(isNaN(search)){
    dataSection.insertAdjacentHTML("beforeend","<p class='fs-4 text-white text-center'>Input is not valid</p>")
  }else{
    getData(url).then(response=>{
      for(i=0;i<response.length;i++){
        if(response[i].hasOwnProperty(option)){
          if(option=="height"){
            var biometricArr = response[i].height.metric.split(" - ")
          }else{
            var biometricArr = response[i].weight.metric.split(" - ")
          }          
          if(range == "max"){
            if(parseInt(biometricArr.length>1 ? biometricArr[1] : biometricArr[0]) <= search){
              var data = {
                id:response[i].id,
                imageUrl:response[i].image.url,
                name:response[i].name,
                temperament:response[i].temperament
              }
              card(data);
            }
          }else{
            if(parseInt(biometricArr[0]) >= search){
              var data = {
                id:response[i].id,
                imageUrl:response[i].image.url,
                name:response[i].name,
                temperament:response[i].temperament
              }
              card(data);
            }
          }          
        }
      }
      if(dataSection.innerHTML==""){
        dataSection.insertAdjacentHTML("beforeend","<p class='fs-4 text-white text-center'>No Data Available</p>")
      }
    })
  }
}

//Render card
function card(data){
  // 1. Using class "Card" from Bootstrap 5
  // 2. Put dog's data in "Card"
  // 3. insert HTML text to element in index.html
  var htmlString = `
    <div class="card m-2 p-2 text-center bg-dark text-white" style="width: 18rem;">
      <img src="${data.imageUrl}" class="card-img-top" alt="No Image Available">
      <div class="card-body">
        <h5 class="card-title">${data.name}</h5>
        <p class="card-text">Temperament: ${data.temperament}</p>
        <button class="btn btn-primary stretched-link" type="button" onclick="dogDetails(${data.id})"data-bs-toggle="modal" data-bs-target="#dog-details">
          Learn more!
        </button>
      </div>
    </div>
  `.replaceAll("undefined","")
  dataSection.insertAdjacentHTML("beforeend",htmlString)
}

//Pagination
function pagination(url){
  // 1. get data for all dogs to know how many of them
  // 2. Set how many pages by: ((number of dogs-(number of dogs modulo by limit)/limit))+1
  // 3. Make HTML text
  // 4. Insert HTML text to element in index.html

  getData(url).then(response => {
      //Maximum page
      var maxPage = response.length%limit == 0 ? response.length/limit:((response.length-(response.length%limit))/limit)+1
      var pageInt = parseInt(page)
      var htmlString = `
        <li class="page-item ${(page==1) ? "disabled":"" }">
          <a class="page-link bg-dark ${(page==1) ? "text-muted":"text-white" }" href="${ (pageInt-1 == 1)? "index.html":"?page="+(pageInt-1) }">Previous</a>
        </li>
      `
      for(var i = 0; i < maxPage; i++){
        htmlString +=`
          <li class="page-item ${(i+1 == page) ? "active" :"" }">
            <a href="${(i+1 == 1)? "index.html":"?page="+(i+1) }" class="page-link bg-dark text-white" id="page-link">${(i+1)}</a>
          </li>
        `
      }
      htmlString += `
        <li class="page-item ${(page == maxPage) ? "disabled":"" }">
          <a class="page-link bg-dark ${(page==maxPage) ? "text-muted":"text-white" }" href="?page=${ pageInt+1 }">Next</a>
        </li>
      `
      document.getElementById("pagination").insertAdjacentHTML("afterbegin",htmlString)
    }
  )
}

// Dog's details on modal
function dogDetails(data){
  // 1. Get list of dog's images with dog's details
  // 2. Put images on carousel
  // 3. Check if dog's has property that we want to show
  // 4. if dog's has property that we want to show, put that property value inside Modal's body with table
  // 5. Insert HTML text to element in index.html

  //https://api.thedogapi.com/v1/images/search?breed_ids=1&api_key={{API_KEY}}&limit={{LIMIT}}&page={{PAGE}}&order={{ORDER}}
  var url = path + "images/search?"+api_key+"&breed_ids="+data+"&limit=5&page=0&order=Asc"
  getData(url).then(response=>{
    var breed = (response.length>0 ? response[0].breeds[0]: 0)
    //If there is no data
    if(breed==0){
      document.getElementById("dog-name").innerHTML = "Error"
      document.getElementById("modal-body").innerHTML = "There is no data"
      return
    }
    //Modal title
    document.getElementById("dog-name").innerHTML = breed.name
    var bodyString = `
    <div id="carouselIndicators" class="carousel slide my-2" data-bs-ride="carousel">
        <ul class="carousel-indicators">
    `
    for(i=0; i<response.length; i++){
      bodyString+=`
          <li type="button" data-bs-target="#carouselIndicators" data-bs-slide-to="${i}" class="${(i==0 ? 'active " aria-current="true"':"" )} aria-label="Slide ${i+1}"></li>
      `
    }
    bodyString +=`
        </ul>
        <div class="carousel-inner">
    `
    for(i=0; i<response.length; i++){
      bodyString +=`
          <div class="carousel-item ${(i==0) ? "active" : "" }">
            <div class="d-flex justify-content-center" >
              <img src="${response[i].url}" class="" height="280px" alt="...">
            </div>
          </div>
      `
    }
    bodyString += `
        </div>
        <a class="carousel-control-prev" role="button" href="#carouselIndicators" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </a>
        <a class="carousel-control-next" role="button" href="#carouselIndicators" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </a>
      </div>
      
      <table class="table table-dark table-striped m-2 text-justify">`
      if(breed.hasOwnProperty("weight")){
        bodyString+=`
          <tr>
            <td>Weight</td><td>:</td><td>${breed.weight.imperial} lb / ${breed.weight.metric} kg</td>
          </tr>
        `
      }
      if(breed.hasOwnProperty("height")){
        bodyString+=`
          <tr>
            <td>Height</td><td>:</td><td>${breed.height.imperial} in / ${breed.height.metric} cm</td>
          </tr>
        `
      }
      if(breed.hasOwnProperty("bred_for")){
        bodyString+=`
          <tr>
            <td>Breed for</td><td>:</td><td>${breed.bred_for}</td>
          </tr>
        `
      }
      if(breed.hasOwnProperty("breed_group")){
        bodyString+=`
          <tr>
            <td>Breed Group</td><td>:</td><td>${breed.breed_group}</td>
          </tr>
        `
      }
      if(breed.hasOwnProperty("life_span")){
        bodyString+=`
          <tr>
            <td>Life Span</td><td>:</td><td>${breed.life_span}</td>
          </tr>
        `
      }
      if(breed.hasOwnProperty("temperament")){
        bodyString+=`
          <tr>
            <td>Temperament</td><td>:</td><td>${breed.temperament}</td>
          </tr>
        `
      }
      if(breed.hasOwnProperty("origin")){
        bodyString+=`
          <tr>
          <td>Origin</td><td>:</td><td>${breed.origin}</td>
          </tr>
        `
      }
      if(breed.hasOwnProperty("description")){
        bodyString+=`
          <tr>
          <td>Description</td><td>:</td><td>${breed.description}</td>
          </tr>
        `
      }
      bodyString +="</table>"
    //Modal body
    document.getElementById("modal-body").innerHTML = bodyString
  })
}

//Remove the data on modal after the modal hidden
document.getElementById("dog-details").addEventListener("hidden.bs.modal",function(){
  document.getElementById("dog-name").innerHTML = ""
  document.getElementById("modal-body").innerHTML = "<h3>Loading</h3>"
})