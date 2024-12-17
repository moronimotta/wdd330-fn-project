
// make a request to get the meal plan
// populate if the meal plan is available


// create a div for the response that will fade in when the response is received
import { promptSender } from "./GoogleAi.mjs";
import Authentication from "./Authentication.mjs";


// DOM fully loaded
document.addEventListener("DOMContentLoaded", () => {

  const auth = new Authentication();
  const ok = auth.isAuthenticated();

  if (!ok) {
    window.location.href = "/authentication/login";
  }



  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mealTablesContainer = document.querySelector(".meal-tables");

  const copyBtn = document.getElementById("response-copy-btn");

  const addNoteBtn = document.getElementById("add-note-btn");

  copyBtn.addEventListener("click", copyToClipboard);

  addNoteBtn.addEventListener("click", saveQuickNote);


  // Dynamically generate tables for each day
  daysOfWeek.forEach(day => {
    const tableHTML = `
      <div class="table-wrapper" id="${day.toLowerCase()}">
          <h3>${day}</h3>
          <table>
              <thead>
                  <tr>
                      <th>Meal</th>
                      <th>Time</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td><input type="text" placeholder="Enter meal"></td>
                      <td><input type="time"></td>
                      <td>
                          <button class="add-row">+</button>
                          <button class="delete-row">-</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
    `;
    mealTablesContainer.insertAdjacentHTML("beforeend", tableHTML);
  });

  const searchButton = document.getElementById("prompt-btn");
  if (searchButton) {
    searchButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const input = document.querySelector("#search-input").value;
      const type = document.querySelector("#search-type").value;

      try {
        const response = await promptSender(input, type);

        if (response) {
          renderResponse(type, response); // Pass the type and formatted response
        }
      } catch (error) {
        console.error("Error fetching response:", error);
      }
    });
  }
});

// TODO: Implement the saveQuickNote function
function saveQuickNote() {
  const note = document.getElementById("quick-note").value;
  localStorage.setItem("quick-note", note);
}

function copyToClipboard() {
  // Get the response div
  const responseDiv = document.getElementById("response");

  if (responseDiv) {
    // Get the inner text of the response div
    const textToCopy = responseDiv.innerText;

    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Notify the user
        alert("Copied the text: " + textToCopy);
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy text.");
      });
  } else {
    alert("No response available to copy.");
  }
}

// Render the response dynamically into the div
function renderResponse(type, data) {
  const responseContainer = document.querySelector(".response-container");
  const responseDiv = document.querySelector("#response") || createResponseDiv(responseContainer);

  if (type === "recipe") {
    responseDiv.innerHTML = `
      <h4>Recipe: ${data.name}</h4>
      <p><strong>Ingredients:</strong> ${data.ingredients.join(", ")}</p>
      <p><strong>Fats:</strong> ${data.fats}</p>
      <p><strong>Carbs:</strong> ${data.carbs}</p>
      <p><strong>Proteins:</strong> ${data.proteins}</p>
      <p><strong>Preparation:</strong> ${data.preparation}</p>
    `;
  } else if (type === "nutrition") {
    responseDiv.innerHTML = `
      <h4>Nutrition Facts for ${data.name}</h4>
      <p><strong>Quantity:</strong> ${data.quantity}</p>
      <p><strong>Protein:</strong> ${data.protein}</p>
      <p><strong>Fat:</strong> ${data.fat}</p>
      <p><strong>Carbs:</strong> ${data.carb}</p>
    `;
  } else if (type === "macronutrient") {
    responseDiv.innerHTML = `
      <h4>Daily Macronutrient Needs</h4>
      <p><strong>Sex:</strong> ${data.sex}</p>
      <p><strong>Height:</strong> ${data.height} cm</p>
      <p><strong>Weight:</strong> ${data.weight} kg</p>
      <p><strong>Age:</strong> ${data.age} years</p>
      <p><strong>Goal:</strong> ${data.goal}</p>
      <p><strong>Daily Protein:</strong> ${data.dailyMacronutrientBreakdown.protein}g</p>
      <p><strong>Daily Fat:</strong> ${data.dailyMacronutrientBreakdown.fat}g</p>
      <p><strong>Daily Carbs:</strong> ${data.dailyMacronutrientBreakdown.carbs}g</p>
    `;
  } else {
    responseDiv.innerHTML = `<p>Unknown response type</p>`;
  }

  responseDiv.style.opacity = 1;
}

function createResponseDiv(container) {
  const responseDiv = document.createElement("div");
  responseDiv.id = "response";
  responseDiv.style.opacity = 0;
  responseDiv.style.transition = "opacity 0.5s ease";
  container.appendChild(responseDiv);
  return responseDiv;
}


function formatMealPlan(mealPlan) {
  const formattedMealPlan = {
    user_id: mealPlan.user_id,
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  days.forEach(day => {
    const dayElement = document.getElementById(day);
    const rows = dayElement.querySelectorAll("tbody tr");

    rows.forEach(row => {
      const meal = row.querySelector("input[type='text']").value;
      const time = row.querySelector("input[type='time']").value;

      if (meal && time) {
        formattedMealPlan[day].push({ meal, time });
      }
    });
  });

  return formattedMealPlan;
}
