console.log("✅ JS LOADED");

/* ================= PAGE SECURITY ================= */
function checkAccess(){
    let role = localStorage.getItem("userRole");

    if(location.pathname.includes("report.html")){
        if(role !== "citizen"){
            alert("Please login first");
            window.location = "login.html";
        }
    }
}

function logout(){
    localStorage.clear();
    window.location = "login.html";
}

/* ================= SIGNUP ================= */
function signup(){
    let name = document.getElementById("name")?.value;
    let email = document.getElementById("email")?.value;
    let password = document.getElementById("password")?.value;

    if(!name || !email || !password){
        alert("Fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    if(users.find(u => u.email === email)){
        alert("User already exists");
        return;
    }

    users.push({name, email, password});
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful");
    window.location = "login.html";
}

/* ================= LOGIN ================= */
function login(){
    let email = document.getElementById("email")?.value;
    let password = document.getElementById("password")?.value;

    let users = JSON.parse(localStorage.getItem("users") || "[]");

    let user = users.find(u => u.email === email && u.password === password);

    if(!user){
        alert("Invalid credentials");
        return;
    }

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", "citizen");

    alert("Login successful");
    window.location = "report.html";
}

/* ================= SUBMIT ISSUE ================= */
async function submitReport(){
    console.log("🚀 Button clicked");

    let file = document.getElementById("image")?.files[0];
    let location = document.getElementById("location")?.value;
    let user = localStorage.getItem("userEmail");

    if(!file){
        alert("Upload image first");
        return;
    }

    if(!location){
        alert("Enter location");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userEmail", user);
    formData.append("location", location);

    try{
        console.log("📡 Calling API...");

        const res = await fetch("https://fatimibee-civicissueagentbackend.hf.space/start_issue", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        console.log("✅ API Response:", data);

        const thread_id = data.thread_id;
        const emailDraft = data.emailDraft;
        const issue = data.issue || "Issue detected";

        // ✅ SUCCESS CASE
        if(thread_id && emailDraft){
            localStorage.setItem("thread_id", thread_id);

            showResult(issue, location, emailDraft);
        }
        else{
            // 🔥 FALLBACK (VERY IMPORTANT)
            console.log("⚠️ Using fallback");

            showResult(
                "Pothole detected",
                location,
                "This is a demo email. Backend service is currently unavailable."
            );
        }

    } catch(err){
        console.error("❌ ERROR:", err);

        // 🔥 FALLBACK IF API FAILS
        showResult(
            "Pothole detected",
            location,
            "Demo email: Backend not responding."
        );
    }
}

/* ================= SHOW RESULT ================= */
function showResult(issue, location, emailDraft){
    document.getElementById("result").innerHTML = `
        <h3>Detected Issue: ${issue}</h3>
        <p><b>Location:</b> ${location}</p>

        <textarea id="suggestion" style="width:100%;height:120px;">
${emailDraft}
        </textarea><br><br>

        <button onclick="approve(true)">Approve & Send</button>
        <button onclick="approve(false)">Edit & Send</button>
    `;
}

/* ================= APPROVE ================= */
async function approve(isApproved){
    const thread_id = localStorage.getItem("thread_id");
    const suggestion = document.getElementById("suggestion")?.value;

    if(!thread_id){
        alert("Session expired");
        return;
    }

    try{
        const res = await fetch("https://fatimibee-civicissueagentbackend.hf.space/human_action", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                thread_id: thread_id,
                approval: isApproved,
                suggestion: suggestion
            })
        });

        const data = await res.json();
        console.log("📩 Response:", data);

        alert("✅ Action completed");

    } catch(err){
        console.log(err);
        alert("⚠️ Backend issue (demo mode)");
    }
}

/* ================= PAGE LOAD ================= */
window.onload = function(){
    console.log("🌍 Page loaded");
    checkAccess();
};