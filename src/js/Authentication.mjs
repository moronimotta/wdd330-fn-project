const baseURL = import.meta.env.VITE_SERVER_URL;
import {setLocalStorage} from "./utils.mjs";
import getLocalStorage from "./utils.mjs";

export default class Authentication {
   
    // register
    async register(userData) {
        try {
              // Send the POST request to the server
              const response = await fetch(baseURL + "/users", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
              });
        
              if (response.ok) {
                const result = await response.json();
                alert("Registration successful! Welcome, " + result.firstName);
        
                // Save user data to localStorage
                const userAccount = {
                  id: result.user.id,
                  name: result.user.name,
                  email: result.user.email,
                  height: result.user.height,
                  weight: result.user.weight,
                  age: result.user.age,
                  gender: result.user.gender,
                  goal: result.user.goal,
                  goalMacroProteins: result.user.goal_macro_proteins,
                  goalMacroCarbs: result.user.goal_macro_carbs,
                  goalMacroFats: result.user.goal_macro_fats,
                };
        
                setLocalStorage("userAccount", userAccount);
        
                const test = getLocalStorage("userAccount");
                console.log(test);
        
                // Optionally redirect to a login or welcome page
                // window.location.href = "/welcome";
              } else {
                const error = await response.json();
                alert("Registration failed: " + error.message);
              }
            } catch (error) {
              console.error("Error during registration:", error);
              alert("An unexpected error occurred. Please try again later.");
            }
  

    
    }

    async login(email, password) {
      try {
        // Construct the URL with parameters
     const url = `${baseURL}/users/${encodeURIComponent(email)}/${encodeURIComponent(password)}`;
 
     // Send the GET request
     const response = await fetch(url, {
       method: "GET",
     });
 
     if (response.ok) {
       // Parse the JSON response
       const user = await response.json();
       setLocalStorage("userAccount", user);
       window.location.href = "/profile/index.html";
     } else {
       // Handle errors
       const error = await response.json();
       console.error("Error fetching user:", error.message);
       throw new Error(error.message);
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

