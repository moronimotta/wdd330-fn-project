import Authentication from "./Authentication.mjs";

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("userAccount")) {
    window.location.href = "/profile/index.html";
  }
  const loginForm = document.querySelector(".login-form");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Gather form data
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Validate form inputs
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }
  
    const auth = new Authentication();
    auth.login(email, password);
    
  });
});
