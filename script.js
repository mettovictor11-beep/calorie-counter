const STORAGE_KEY = "calorieCounterItems";

const foodForm = document.getElementById("foodForm");
const foodList = document.getElementById("foodList");
const totalCalories = document.getElementById("totalCalories");
const resetButton = document.getElementById("resetButton");
const loadSampleButton = document.getElementById("loadSampleButton");

let foods = loadFoods();

function loadFoods() {
    const savedFoods = localStorage.getItem(STORAGE_KEY);

    if (!savedFoods) {
        return [];
    }

    try {
        return JSON.parse(savedFoods);
    } catch (error) {
        console.error("Unable to parse saved food items:", error);
        return [];
    }
}

function saveFoods() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

function calculateTotal() {
    return foods.reduce((sum, food) => sum + Number(food.calories), 0);
}

function updateTotal() {
    if (!totalCalories) return;
    totalCalories.textContent = `${calculateTotal()} calories`;
}

function renderFoods() {
    if (!foodList) return;

    foodList.innerHTML = "";

    foods.forEach((food) => {
        const listItem = document.createElement("li");
        listItem.className = "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm";

        const foodText = document.createElement("span");
        foodText.textContent = `${food.name}: ${food.calories} calories`;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600";
        removeButton.addEventListener("click", () => {
            foods = foods.filter((item) => item.id !== food.id);
            saveFoods();
            renderFoods();
            updateTotal();
        });

        listItem.append(foodText, removeButton);
        foodList.appendChild(listItem);
    });
}

function addFood(name, calories) {
    const newFood = {
        id: Date.now() + Math.random(),
        name,
        calories,
    };

    foods.push(newFood);
    saveFoods();
    renderFoods();
    updateTotal();
}

async function fetchFoodData() {
    const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify([
        { name: "Apple", calories: 95 },
        { name: "Banana", calories: 105 },
        { name: "Chicken Breast", calories: 165 },
        { name: "Rice Bowl", calories: 350 },
        { name: "Salad", calories: 220 }
    ]));

    const response = await fetch(dataUrl);

    if (!response.ok) {
        throw new Error("Could not load food data.");
    }

    return response.json();
}

if (foodForm) {
    foodForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const foodNameInput = document.getElementById("foodName");
        const caloriesInput = document.getElementById("calories");

        if (!foodNameInput || !caloriesInput) {
            return;
        }

        const foodName = foodNameInput.value.trim();
        const calories = Number(caloriesInput.value);

        if (!foodName || Number.isNaN(calories) || calories <= 0) {
            alert("Please enter a valid food name and calorie count.");
            return;
        }

        addFood(foodName, calories);
        foodForm.reset();
        foodNameInput.focus();
    });
}

if (resetButton) {
    resetButton.addEventListener("click", function () {
        foods = [];
        saveFoods();
        renderFoods();
        updateTotal();
    });
}

if (loadSampleButton) {
    loadSampleButton.addEventListener("click", async function () {
        try {
            const sampleFoods = await fetchFoodData();

            sampleFoods.forEach((food) => {
                const alreadyExists = foods.some((item) => item.name.toLowerCase() === food.name.toLowerCase());

                if (!alreadyExists) {
                    addFood(food.name, food.calories);
                }
            });
        } catch (error) {
            console.error(error);
            alert("Sample food data could not be loaded.");
        }
    });
}

renderFoods();
updateTotal();