import { promptSender } from "./GoogleAi.mjs";
import Authentication from "./Authentication.mjs";
const baseURL = import.meta.env.VITE_SERVER_URL;
import getLocalStorage from "./utils.mjs";
import { loadHeaderFooter, loadBtnAccount } from "./utils.mjs";




document.addEventListener("DOMContentLoaded", () => {
  const auth = new Authentication();
  const ok = auth.isAuthenticated();

  if (!ok) {
    window.location.href = "/authentication/login";
  }
  loadHeaderFooter().then(() => {
    loadBtnAccount();
});

  const mealPlanSubmitBtn = document.getElementById("meal-plan-submit");
  mealPlanSubmitBtn.addEventListener("click", submitMealPlan);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mealTablesContainer = document.querySelector(".meal-tables");

  const copyBtn = document.getElementById("response-copy-btn");

  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }

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



  mealTablesContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-row")) {
      e.preventDefault();
      const tableBody = e.target.closest("table").querySelector("tbody");

      const newRowHTML = `
        <tr>
          <td><input type="text" placeholder="Enter meal"></td>
          <td><input type="time"></td>
          <td>
            <button class="add-row">+</button>
            <button class="delete-row">-</button>
          </td>
        </tr>
      `;

      tableBody.insertAdjacentHTML("beforeend", newRowHTML);
    } else if (e.target.classList.contains("delete-row")) {
      e.preventDefault();
      const tableBody = e.target.closest("tbody");
      const rows = tableBody.querySelectorAll("tr");

      if (rows.length > 1) {
        const row = e.target.closest("tr");
        row.remove();
      } else {
        alert("You need to have at least one row");
      }
    }
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
        alert("Error fetching response:", error);
      }
    });
  }
});

fetchMealPlan();

async function submitMealPlan() {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const mealPlan = {};

  days.forEach(day => {
    const dayMeals = document.getElementById(day).querySelectorAll("tbody tr");
    mealPlan[day] = [];

    dayMeals.forEach(row => {
      const meal = row.querySelector("input[type='text']").value;
      const time = row.querySelector("input[type='time']").value;

      if (meal && time) {
        mealPlan[day].push({ meal, time });
      }
    });
  });

  const userAccount = getLocalStorage("userAccount");

  const input = {
    user_id: userAccount.id,
    ...mealPlan
  };
  try {
    const response = await fetch(`${baseURL}/meal-plans`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      alert("Meal plan submitted successfully!");
    } else {
      const error = await response.json();
      alert("Failed to submit meal plan: " + error.error);
    }
  } catch (error) {
    alert("Error submitting meal plan:", error);
  }
}

function copyToClipboard() {
  const responseDiv = document.getElementById("response");

  if (responseDiv) {
    const textToCopy = responseDiv.innerText;

    navigator.clipboard.writeText(textToCopy)
      .catch(err => {
        alert("Failed to copy text: ", err);
      });
  } else {
    alert("No response available to copy.");
  }
}

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
      <p><strong>Preparation:</strong> ${data.preparation_text}</p>
    `;
  } else if (type === "nutrition") {
    responseDiv.innerHTML = `
      <h4>Nutrition Facts for ${data.name}</h4>
      <p><strong>Quantity:</strong> ${data.quantity}</p>
      <p><strong>Protein:</strong> ${data.protein}</p>
      <p><strong>Fat:</strong> ${data.fat}</p>
      <p><strong>Carbs:</strong> ${data.carb}</p>
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


async function fetchMealPlan() {
  const userAccount = getLocalStorage("userAccount");

  try {
    const response = await fetch(`${baseURL}/meal-plans/user/${userAccount.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch meal plan");

    const mealPlan = await response.json();
    populateMealPlan(mealPlan.meal);
  } catch (error) {
    alert("Failed to fetch meal plan. Please try again later.");
  }
}


function populateMealPlan(mealPlan) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  days.forEach(day => {
    const tableBody = document.getElementById(day)?.querySelector("tbody");
    if (tableBody) {
      tableBody.innerHTML = ""; // Clear existing rows
      const dailyMeals = mealPlan[day] || {}; // Use the data from the response or default to empty object

      dailyMeals.forEach(({ meal, time }) => {
        const newRowHTML = `
          <tr>
        <td><input type="text" placeholder="Enter meal" value="${meal}"></td>
        <td><input type="time" value="${time}"></td>
        <td>
          <button class="add-row">+</button>
          <button class="delete-row">-</button>
        </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", newRowHTML);
      });

      if (dailyMeals.length === 0) {
        const emptyRowHTML = `
          <tr>
        <td><input type="text" placeholder="Enter meal"></td>
        <td><input type="time"></td>
        <td>
          <button class="add-row">+</button>
          <button class="delete-row">-</button>
        </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", emptyRowHTML);
      }
    }
  });
}
