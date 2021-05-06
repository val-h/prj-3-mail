document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // use the api to send an email
  document.querySelector('#compose-form').addEventListener('submit', () => {
    fetch('emails/', {
      method: 'POST',
      // mode: 'cors',
      // credentials: 'include',
      body: JSON.stringify({
        recepients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
        // recepients: 'val@localhost.com',
        // subject: 'test',
        // body: 'test',
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(e => {
      console.log(e)
    });
  });

  // continue with the api work, tried another way with cors, didn't work
  // only the emails/<int:email_id> works, try downgrading the django version
  // or something similar

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}