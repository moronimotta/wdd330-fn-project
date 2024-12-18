import { setLocalStorage } from "./utils.mjs";
import getLocalStorage from "./utils.mjs";
const baseURL = import.meta.env.VITE_SERVER_URL;

export default class Profile {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }

    async init() {
        const submitNoteBtn = document.getElementById("note-add");
        const submitProfileBtn = document.getElementById("profile-submit");

        submitProfileBtn.addEventListener("click", () => this.submitForm());
        submitNoteBtn.addEventListener("click", () => this.submitForm());
 
        const userAccount = await this.getData(this.email);

        this.fillInputs(userAccount.user);

        // try {
        //     const url = `${baseURL}/meal-plans/user/${this.id}`;
        //     const response = await fetch(url, {
        //         method: "GET",
        //     });

        //     if (response.ok) {
        //         // Parse the JSON response
        //         const meals = await response.json();

        //         this.nextMeal(meals);
        //         console.log("Meals retrieved:", meals);
        //     } else {
        //         // Handle errors
        //         const error = await response.json();
        //         console.error("Error fetching meals:", error.error);
        //         throw new Error(error.error);
        //     }
        // }
        // catch (error) {
        //     console.error("Error during login:", error);
        //     alert("An unexpected error occurred. Please try again later.");
        // }
    }

    async submitForm() {
        const userAccount = {}
        const nameInput = document.getElementById("name");
        const lastNameInput = document.getElementById("last-name");
        const emailInput = document.getElementById("email");
        const ageInput = document.getElementById("age");
        const heightInput = document.getElementById("height");
        const weightInput = document.getElementById("weight");
        const genderInput = document.getElementById("gender");
        const goalInput = document.getElementById("goal");
        const activityFactor = document.getElementById("activity-factor");

        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirm-password");

        if(passwordInput.value !== "" &&  confirmPasswordInput.value !== "") {
            if (passwordInput.value !== confirmPasswordInput.value) {
                alert("Passwords do not match.");
                return;
            }
            userAccount.password = passwordInput.value;
        }

        userAccount.name = nameInput.value;
        userAccount.last_name = lastNameInput.value;
        userAccount.email = emailInput.value;
        userAccount.age = parseInt(ageInput.value, 10);
        userAccount.height = parseFloat(heightInput.value);
        userAccount.weight = parseFloat(weightInput.value);
        userAccount.goal = goalInput.value;
        userAccount.gender = genderInput.value;
        userAccount.activity_factor = activityFactor.value;

        const macros = this.calculateMacronutrients(userAccount);
        userAccount.goal_macro_proteins = parseFloat(macros.proteins);
        userAccount.goal_macro_carbs = parseFloat(macros.carbs);
        userAccount.goal_macro_fats = parseFloat(macros.fats);

        const notesDiv = document.querySelector(".notes-details");
        const textarea = notesDiv.querySelector("textarea");
        const notes = textarea.value;

        userAccount.notes = notes;
        await this.updateData(userAccount, userAccount.email);
    }

    async getData(email) {
        try {
            const url = `${baseURL}/users/${encodeURIComponent(email)}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (response.ok) {
                const user = await response.json();
                return user;
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

    async updateData(userData, email) {
        try {
            const url = `${baseURL}/users/${encodeURIComponent(email)}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok) {
                const { user } = result;

                if (!user) {
                    alert("Update failed: Invalid response from server.");
                    return;
                }

                alert("Update successful!");
                location.reload();
            } else {
                // Handle errors from the server
                const errorMessage = result.error || "Failed to update user.";
                alert("Update failed: " + errorMessage);
            }
        } catch (error) {
            console.error("Error during update:", error);
            alert("An unexpected error occurred. Please try again later.");
        }
    }


    calculateMacronutrients(userAccount) {
        if (!userAccount.weight || !userAccount.height || !userAccount.age || !userAccount.activity_factor) {
            return { proteins: 0, carbs: 0, fats: 0 };
        }

        const bmr = 10 * userAccount.weight + 6.25 * userAccount.height - 5 * userAccount.age + (userAccount.gender === "male" ? 5 : -161);
        const maintenanceCalories = bmr * parseFloat(userAccount.activity_factor);

        let totalCalories;
        if (userAccount.goal === "cutting") {
            totalCalories = maintenanceCalories * 0.8;
        } else if (userAccount.goal === "bulking") {
            totalCalories = maintenanceCalories * 1.2;
        } else {
            totalCalories = maintenanceCalories;
        }

        const proteinPercentage = 0.4;
        const carbPercentage = 0.35;
        const fatPercentage = 0.25;

        const proteins = Math.round((totalCalories * proteinPercentage) / 4);
        const carbs = Math.round((totalCalories * carbPercentage) / 4);
        const fats = Math.round((totalCalories * fatPercentage) / 9);

        return { proteins, carbs, fats };
    }

    fillInputs(userAccount) {
        document.getElementById("name").value = userAccount.name || "";
        document.getElementById("last-name").value = userAccount.last_name || "";
        document.getElementById("email").value = userAccount.email || "";
        document.getElementById("age").value = userAccount.age || "Insert age";
        document.getElementById("height").value = userAccount.height || "Insert height";
        document.getElementById("weight").value = userAccount.weight || "Insert weight";
        document.getElementById("gender").value = userAccount.gender || "Select one"
        document.getElementById("goal").value = userAccount.goal || "Insert goal";
        const activityFactorSelect = document.getElementById("activity-factor");
        activityFactorSelect.value = userAccount.activity_factor || "Insert activity factor";


        let macroDetails = document.getElementsByClassName("macronutrient-details")
        let p = document.createElement("p");
        p.innerHTML = `Proteins: ${userAccount.goal_macro_proteins}g, Carbs: ${userAccount.goal_macro_carbs}g, Fats: ${userAccount.goal_macro_fats}g`;
        macroDetails[0].appendChild(p);


        const notesDiv = document.querySelector(".notes-details");
        const textarea = document.createElement("textarea");
        textarea.value = userAccount.notes || "Start typing here...";
        notesDiv.appendChild(textarea);
    }
}
