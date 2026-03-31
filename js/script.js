
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

if (location.pathname.includes("login.html")) {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
}

function logout(){
 localStorage.removeItem("userEmail");
 localStorage.removeItem("userRole");
 window.location="login.html";
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

// 🔥 CLEAR FORM
document.getElementById("name").value="";
document.getElementById("email").value="";
document.getElementById("password").value="";

alert("Account created successfully");

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

// SAVE LOGIN
localStorage.setItem("userEmail",email);
localStorage.setItem("userRole",role);

saveUserAPI(email);

// 🔥 CLEAR INPUTS (IMPORTANT)
document.getElementById("email").value="";
document.getElementById("password").value="";

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

 addDepartmentAPI();
 
loadCitizen();
 alert("Issue submitted");

}

reader.readAsDataURL(file);
}

/* CITIZEN HISTORY */
async function getUserComplaintHistory(userId) {

    try {

        const response = await fetch("https://web-production-fe871.up.railway.app/user_history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userId
            })
        });

        const data = await response.json();

        console.log("Complaint History:", data);

        displayComplaints(data);

    } catch (error) {
        console.error("Error fetching complaint history:", error);
    }
}

function displayComplaints(complaints) {

    const container = document.getElementById("citizenReports");

    if(!container) return;

    container.innerHTML = "";

    complaints.forEach((complaint) => {

        const card = `
        <div class="report-item">

            <div>
                <p><b>Title:</b> ${complaint.title || "Issue"}</p>
                <p><b>Description:</b> ${complaint.description || "-"}</p>
                <p><b>Status:</b> ${complaint.status}</p>
            </div>

        </div>
        `;

        container.innerHTML += card;
    });
}

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
async function loadAuthority(){

try{

const response = await fetch("https://web-production-fe871.up.railway.app/issues/1");

const data = await response.json();

const box=document.getElementById("authorityReports");

if(!box) return;

box.innerHTML="";

data.forEach((issue)=>{

box.innerHTML+=`

<div class="report-item">

<img src="${issue.image_url}" width="140">

<div>

<p><b>Department:</b> ${issue.department}</p>

<p><b>Status:</b> ${issue.status}</p>

<button>Toggle Status</button>

</div>

</div>

`;

});

}catch(error){

console.log(error);

}

}
function toggleStatus(i){

let reports=JSON.parse(localStorage.getItem("reports")||"[]");

reports[i].status = reports[i].status==="Pending" ? "Approved" : "Pending";

localStorage.setItem("reports",JSON.stringify(reports));

updateStatusAPI(i,"Approved");

loadAuthority();
}

/* PAGE LOAD */
window.onload=function(){

 checkAccess();

 let user = localStorage.getItem("userEmail");

 if(user){
   getUserComplaintHistory(user);
 }

 loadAuthority();

}

async function saveUserAPI(email){
 try{
  await fetch("https://web-production-fe871.up.railway.app/save_user",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ email })
  });
  console.log("User saved");
 }catch(e){ console.log("save_user failed"); }
}

async function addDepartmentAPI(){
 try{
  await fetch("https://web-production-fe871.up.railway.app/add_department",{
    method:"POST"
  });
  console.log("Department added");
 }catch(e){ console.log("department failed"); }
}

async function updateStatusAPI(id,status){
 try{
  await fetch("https://web-production-fe871.up.railway.app/save_user",{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      complaint_id:id,
      status:status
    })
  });
  console.log("Status updated");
 }catch(e){ console.log("update failed"); }
}
