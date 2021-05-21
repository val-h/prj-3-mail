document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_email;
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  load_mail(mailbox)

}

function send_email() {
  const recepients = document.querySelector('#compose-recepients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recepients);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recepients: recepients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
  .catch(e => {
    console.log(e);
  })
}

function load_mail(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);

    emails_view = document.querySelector('#emails-view');
    for (i = 0; i < emails.length; i++) {
      const crnt_email = emails[i]
      // Create the container that will hold the email
      mail_container = document.createElement('DIV');
      // mail_container.innerHTML = emails[i].subject;
      mail_container.className = 'mail';
      mail_container.addEventListener('click', () => detail_view(crnt_email));

      // Create the subject section
      mail_subject = document.createElement('DIV');
      mail_subject.innerHTML = crnt_email.subject + crnt_email.id;
      mail_subject.className = 'mail-subject';

      // Add a date field
      mail_date = document.createElement('div');
      mail_date.innerHTML = crnt_email.timestamp;
      mail_date.className = 'mail-date';

      //  Structure the divs
      mail_container.appendChild(mail_subject);
      mail_container.appendChild(mail_date);

      // Check if the email is read
      if (crnt_email.read == true) {
        mail_container.style.background = 'lightgray';
      }

      // Finally appoend the container to the email view
      emails_view.appendChild(mail_container);
    }
  });
}

function detail_view(email) {
  console.log(email)
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#email-from').innerHTML = email.sender;
  document.querySelector('#email-to').innerHTML = email.recepients;
  document.querySelector('#email-subject').innerHTML = email.subject;
  document.querySelector('#email-timestamp').innerHTML = email.timestamp;

  // TODO - add a reply button, put request to /emails/<int:id> for being read

  document.querySelector('#email-body').innerHTML = email.body;
}