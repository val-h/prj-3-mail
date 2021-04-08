document.addEventListener('DOMContentLoaded', () => {
    // When the user submits the compose email form
    document.querySelector('#compose-form').onsubmit = () => {
        // Make a post request to the api to send an email
        fetch('http://localhost:8000/emails', {
            method: 'POST',
            body: JSON.stringify({
                // recepients: 'val-h@localhost.com',
                // subject: 'test',
                // body: 'Just a test email, hardcoded!'

                // there was an error with these querries, returning null
                // now it gives a network error, all and all -> 304 status codes
                recepients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
        // take the response data and log it
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(e => {
            console.log(e)
        });
    };
});
