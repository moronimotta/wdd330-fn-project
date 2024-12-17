const baseURL = import.meta.env.VITE_SERVER_URL;
import {setLocalStorage} from "./utils.mjs";
import getLocalStorage from "./utils.mjs";
import Authentication from "./Authentication.mjs";

window.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Gather form data
    const name = document.getElementById("name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validate form inputs
    if (!name || !lastName || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Prepare payload for the request
    const userData = {
      firstName: name,
      lastName: lastName,
      email: email,
      password: password,
    };

    const auth = new Authentication();
    auth.register(userData);
    
  });
});
