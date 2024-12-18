const baseURL = import.meta.env.VITE_SERVER_URL;
import {setLocalStorage} from "./utils.mjs";
import getLocalStorage from "./utils.mjs";

export default class Authentication {
   
    async register(userData) {
      try {
          const response = await fetch(baseURL + "/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          });
      
          if (response.ok) {
          const result = await response.json();
          alert("Registration successful! Welcome, " + result.user.name + "!");
      
          const userAccount = {
            name: result.user.name,
            email: result.user.email,
          };
      
          setLocalStorage("userAccount", userAccount);
      
          window.location.href = "/profile/index.html";
        } else {
          const error = await response.json();
          alert("Registration failed: " + error.error);
          }
        } catch (error) {
          console.error("Error during registration:", error);
          alert("An unexpected error occurred. Please try again later.");
        }
    }

    async login(email, password) {
      try {
      const url = `${baseURL}/users/${encodeURIComponent(email)}/${encodeURIComponent(password)}`;
   
      const response = await fetch(url, {
        method: "GET",
      });
   
      if (response.ok) {
        const user = await response.json();
        
        const userAccount = {
        name: user.user.name,
        email: user.user.email,
        };
        setLocalStorage("userAccount", userAccount);
        
        alert("Login successful! Welcome, " + user.user.name + "!");
        window.location.href = "/profile/index.html";
      } else {
        const error = await response.json();
        console.error("Error fetching user:", error.error);
        throw new Error(error.error);
      }
      } catch (error) {
      console.error("Error during login:", error);
      alert("An unexpected error occurred. Please try again later.");
      }
    }

    isAuthenticated() {
        const user = getLocalStorage("userAccount");
        return user ? true : false;
    }

}

