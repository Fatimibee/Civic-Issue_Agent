
function login(){

let email=document.getElementById("email").value;
let password=document.getElementById("password").value;
let role=document.querySelector('input[name="role"]:checked').value;

if(!email.includes("@")){
alert("Email must contain @");
return;
}

if(password.length < 4){
alert("Enter password");
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

/* PAGE SECURITY */

function checkAccess(){

let role=localStorage.getItem("userRole");

if(location.pathname.includes("report.html")){
if(role!=="citizen"){
alert("Login as Citizen first");
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

/* SUBMIT ISSUE */

function submitReport(){

let role=localStorage.getItem("userRole");

if(role!=="citizen"){
alert("Only citizen can report");
return;
}

let file=document.getElementById("image").files[0];

if(!file){
alert("Upload image");
return;
}

let reader=new FileReader();

reader.onload=function(){

let reports=JSON.parse(localStorage.getItem("reports")||"[]");

reports.push({
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

let reports=JSON.parse(localStorage.getItem("reports")||"[]");

let box=document.getElementById("citizenReports");

if(!box) return;

box.innerHTML="";

reports.forEach((r)=>{

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
<button onclick="markSolved(${i})">Mark Solved</button>
</div>
</div>
`;

});

}

/* UPDATE STATUS */

function markSolved(i){

let reports=JSON.parse(localStorage.getItem("reports")||"[]");

reports[i].status="Resolved";

localStorage.setItem("reports",JSON.stringify(reports));

loadAuthority();
loadCitizen();

}

window.onload=function(){

checkAccess();
loadCitizen();
loadAuthority();

}
