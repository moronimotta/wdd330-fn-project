import { setLocalStorage } from "./utils.mjs";
import getLocalStorage from "./utils.mjs";
import { promptSender } from "./GoogleAi.mjs";
const baseURL = import.meta.env.VITE_SERVER_URL;


export default class Profile {
    constructor(name, lastName, email, password, id) {
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.id = id;

    }

    async init() {
        const userAccount = getLocalStorage("userAccount");
        const submitNoteBtn = document.getElementById("note-add");
        const submitProfileBtn = document.getElementById("profile-submit");

        submitProfileBtn.addEventListener("click", this.submitForm);
        submitNoteBtn.addEventListener("click", this.addNote);

        this.fillInputs(userAccount);

        try {
            const url = `${baseURL}/meal-plans/user/${this.id}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (response.ok) {
                // Parse the JSON response
                const meals = await response.json();

                this.nextMeal(meals);
                console.log("Meals retrieved:", meals);
            } else {
                // Handle errors
                const error = await response.json();
                console.error("Error fetching meals:", error.message);
                throw new Error(error.message);
            }
        }
        catch (error) {
            console.error("Error during login:", error);
            alert("An unexpected error occurred. Please try again later.");
        }
    }

    async submitForm() {

        const userAccount = getLocalStorage("userAccount");
        const nameInput = document.getElementById("name");
        const lastNameInput = document.getElementById("last-name");
        const emailInput = document.getElementById("email");
        const ageInput = document.getElementById("age");
        const heightInput = document.getElementById("height");
        const weightInput = document.getElementById("weight");
        const genderInput = document.getElementById("gender");
        const goalInput = document.getElementById("goal");

        userAccount.name = nameInput.value;
        userAccount.lastName = lastNameInput.value;
        userAccount.email = emailInput.value;
        userAccount.age = ageInput.value;
        userAccount.height = heightInput.value;
        userAccount.weight = weightInput.value;
        userAccount.goal = goalInput.value;
        userAccount.gender = genderInput.value;


        if (ageInput.value !== "" || heightInput.value !== "" || weightInput.value !== "" || genderInput.value !== "" || goalInput.value !== "") {
            this.setMacronutrients(userAccount);
        } else {
            await this.updateData(userAccount, userAccount.email);
        }

    }

    async setMacronutrients(userAccount) {
        const input_text = {
            height: userAccount.height,
            age: userAccount.age,
            gender: userAccount.gender,
            weight: userAccount.weight,
            goal: userAccount.goal
        }



        const response = await promptSender(input_text, "macronutrients");
        userAccount.goalMacroProteins = response.proteins;
        userAccount.goalMacroCarbs = response.carbs;
        userAccount.goalMacroFats = response.fats;

        await this.updateData(userAccount, userAccount.email);
    }

    async addNote() {
        const userAccount = getLocalStorage("userAccount");
        const notesDiv = document.querySelector(".notes-details");
        const textarea = notesDiv.querySelector("textarea");
        const notes = textarea.value;

        userAccount.notes = notes;
        await this.updateData(userAccount, userAccount.email);
    }

    async updateData(userData, email) {
        try {
            // Send the POST request to the server
            const url = `${baseURL}/users/${encodeURIComponent(email)}`;
            const response = await fetch(url, {
                method: "PUT",
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
                    goal: result.user.goal,
                    goalMacroProteins: result.user.goal_macro_proteins,
                    goalMacroCarbs: result.user.goal_macro_carbs,
                    goalMacroFats: result.user.goal_macro_fats,

                };

                setLocalStorage("userAccount", userAccount);

                location.reload();

            } else {
                const error = await response.json();
                alert("Registration failed: " + error.message);
            }


        } catch (error) {
            console.error("Error during registration:", error);
            alert("An unexpected error occurred. Please try again later.");
        }
    }

    nextMeal(mealPlan) {
        const nextMealSection = document.querySelector(".next-meal-section");
        const now = new Date();
        const currentHour = now.getHours();
        const currentDayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday

        // Map day index to mealPlan keys
        const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        let currentDay = weekDays[currentDayIndex];

        // Helper to parse time (HH:MM) into hours
        function parseMealTime(time) {
            const [hours, minutes] = time.split(":").map(Number);
            return hours + minutes / 60;
        }

        // Find next meal for today and beyond
        let nextMeal = null;

        for (let i = 0; i < 7; i++) {
            const day = weekDays[(currentDayIndex + i) % 7]; // Rotate through days
            const meals = mealPlan[day] || [];

            for (const meal of meals) {
                const mealHour = parseMealTime(meal.time);

                // If on the same day, check for meals later than the current time
                if (i === 0 && mealHour > currentHour) {
                    nextMeal = meal;
                    break;
                }
                // If future day, any meal is the next meal
                if (i > 0) {
                    nextMeal = meal;
                    break;
                }
            }

            if (nextMeal) break; // Stop looping if a next meal is found
        }

        // Update the DOM with the next meal info
        if (nextMeal) {
            nextMealSection.innerHTML = `
            <h3>Next Meal: ${nextMeal.name}</h3>
            <p>Time: ${nextMeal.time}</p>
            <p>Proteins: ${nextMeal.proteins}g, Carbs: ${nextMeal.carbs}g, Fats: ${nextMeal.fats}g</p>
          `;
        } else {
            nextMealSection.innerHTML = `<p>No meals scheduled.</p>`;
        }
    }


    async getMeals() {

        try {
            const url = `${baseURL}/meal-plans/user/${this.id}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (response.ok) {
                // Parse the JSON response
                const meals = await response.json();
                console.log("Meals retrieved:", meals);
                return meals;
            } else {
                // Handle errors
                const error = await response.json();
                console.error("Error fetching meals:", error.message);
                throw new Error(error.message);
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An unexpected error occurred. Please try again later.");
        }

    }

    fillInputs(userAccount) {
        const nameInput = document.getElementById("name");
        nameInput.value = userAccount.name;
        const lastNameInput = document.getElementById("last-name");
        lastNameInput.value = userAccount.lastName;
        const emailInput = document.getElementById("email");
        emailInput.value = userAccount.email;

        const ageInput = document.getElementById("age");
        if (userAccount.age > 0) {
            ageInput.value = userAccount.age;
        }
        const heightInput = document.getElementById("height");
        if (userAccount.height > 0) {
            heightInput.value = userAccount.height;
        }

        const weightInput = document.getElementById("weight");
        if (userAccount.weight > 0) {
            weightInput.value = userAccount.weight;
        }

        const genderInput = document.getElementById("gender")
        if (userAccount.gender !== "") {

            genderInput.value = userAccount.gender;
        }


        const goalInput = document.getElementById("goal");
        if (userAccount.goal !== "") {
            goalInput.value = userAccount.goal;
        }

        const notesDiv = document.querySelector(".notes-details");
        const textarea = document.createElement("textarea");
        if (userAccount.notes === "") {
            textarea.value = "Start typing here...";
        }
        textarea.value = userAccount.notes;
        notesDiv.appendChild(textarea);

        if (userAccount.goalMacroProteins === 0 || userAccount.goalMacroCarbs === 0 || userAccount.goalMacroFats === 0) {
            const macronutrientsDiv = document.querySelector(".macronutrients-details");
            const p = document.createElement("p");
            p.textContent = "Please fill the form to get your macronutrients goals";
            macronutrientsDiv.appendChild(p);

        }

        const text = document.createElement("p");
        text.textContent = "For your goal, you will need daily:";
        const carbs = document.createElement("p");
        carbs.textContent = `Carbohydrates: ${userAccount.goalMacroCarbs}g`;
        const proteins = document.createElement("p");
        proteins.textContent = `Proteins: ${userAccount.goalMacroProteins}g`;
        const fats = document.createElement("p");

    }


}
