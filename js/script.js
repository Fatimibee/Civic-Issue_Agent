
/* PAGE SECURITY */
function checkAccess(){
let role=localStorage.getItem("userRole");

if(location.pathname.includes("report.html")){
 if(role!=="citizen"){
   alert("Please login as Citizen first");
   window.location="login.html";
 }
}

if(location.pathname.includes("authority.html")){
 if(role!=="authority"){
   alert("Login as Authority first");
   window.location="login.html";
 }
}
}

/* SIGNUP */
function signup(){

let name=document.getElementById("name").value;
let email=document.getElementById("email").value;
let password=document.getElementById("password").value;

let users=JSON.parse(localStorage.getItem("users")||"[]");

let exists=users.find(u=>u.email===email);

if(exists){
 alert("User already exists");
 return;
}

users.push({name,email,password});
localStorage.setItem("users",JSON.stringify(users));

alert("Account created");
window.location="login.html";
}

/* LOGIN */
function login(){

let email=document.getElementById("email").value;
let password=document.getElementById("password").value;
let role=document.querySelector('input[name="role"]:checked').value;

let users=JSON.parse(localStorage.getItem("users")||"[]");

let user=users.find(u=>u.email===email && u.password===password);

if(!user){
 alert("Invalid login. Please sign up first");
 return;
}

localStorage.setItem("userEmail",email);
localStorage.setItem("userRole",role);

if(role==="citizen"){
 window.location="report.html";
}else{
 window.location="authority.html";
}
}

/* SUBMIT REPORT */
function submitReport(){

let role=localStorage.getItem("userRole");
let user=localStorage.getItem("userEmail");

if(role!=="citizen"){
 alert("Please login as Citizen first");
 window.location="login.html";
 return;
}

let file=document.getElementById("image").files[0];

if(!file){
 alert("Upload image first");
 return;
}

let reader=new FileReader();

reader.onload=function(){

 let reports=JSON.parse(localStorage.getItem("reports")||"[]");

 reports.push({
  email:user,
  image:reader.result,
  status:"Pending",
  date:new Date().toLocaleString()
 });

 localStorage.setItem("reports",JSON.stringify(reports));

 loadCitizen();
 alert("Issue submitted");

}

reader.readAsDataURL(file);
}

/* CITIZEN HISTORY */
function loadCitizen(){

let user=localStorage.getItem("userEmail");
let reports=JSON.parse(localStorage.getItem("reports")||"[]");
let box=document.getElementById("citizenReports");

if(!box) return;

box.innerHTML="";

reports.filter(r=>r.email===user).forEach((r)=>{

 box.innerHTML+=`
 <div class="report-item">
  <img src="${r.image}" width="140">
  <div>
   <p>Status: ${r.status}</p>
   <p>${r.date}</p>
  </div>
 </div>
 `;

});
}

/* AUTHORITY DASHBOARD */
function loadAuthority(){

let reports=JSON.parse(localStorage.getItem("reports")||"[]");
let box=document.getElementById("authorityReports");

if(!box) return;

box.innerHTML="";

reports.forEach((r,i)=>{

 box.innerHTML+=`
 <div class="report-item">
  <img src="${r.image}" width="140">
  <div>
   <p>Status: ${r.status}</p>
   <button onclick="toggleStatus(${i})">Change Status</button>
  </div>
 </div>
 `;

});
}

function toggleStatus(i){

let reports=JSON.parse(localStorage.getItem("reports")||"[]");

reports[i].status = reports[i].status==="Pending" ? "Approved" : "Pending";

localStorage.setItem("reports",JSON.stringify(reports));

loadAuthority();
}

/* PAGE LOAD */
window.onload=function(){
 checkAccess();
 loadCitizen();
 loadAuthority();
}
