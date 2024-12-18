
import { loadHeaderFooter, loadBtnAccount } from "./utils.mjs";



document.addEventListener("DOMContentLoaded", () => {
    loadHeaderFooter().then(() => {
        loadBtnAccount();
    });
    fetch("/public/json/quotes.json")
        .then(response => response.json())
        .then(data => {
            const quotes = data;
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const cardBody = document.querySelector(".card-body");
            const quoteParagraph = document.createElement("p");
            quoteParagraph.className = "card-text";
            quoteParagraph.innerText = `"${randomQuote.quote}" - ${randomQuote.author}`;
            cardBody.appendChild(quoteParagraph);
        })
});