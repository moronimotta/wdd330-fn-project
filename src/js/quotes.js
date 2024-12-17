document.addEventListener('DOMContentLoaded', () => {
    fetch('/public/json/quotes.json')
        .then(response => response.json())
        .then(data => {
            const quotes = data; 
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const cardBody = document.querySelector('.card-body');
            const quoteParagraph = document.createElement('p');
            quoteParagraph.className = 'card-text';
            quoteParagraph.innerText = `"${randomQuote.quote}" - ${randomQuote.author}`;
            cardBody.appendChild(quoteParagraph);
        })
        .catch(error => console.error('Error fetching quotes:', error));
});