document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', () => send_email());

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

  // Load the specific mailbox
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
        mail_subject.innerHTML = `${crnt_email.sender} - ${crnt_email.subject}`;
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

// Send email
function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(e => {
      console.log(e);
    });

  // it starts to load the sent mailbox and then recieves the js file
  // a new and loads again its contents -> setting inbox by default
  console.log('loading sent mailbox...');
  load_mailbox('sent');
  console.log('sent mailbox...');
}

// Single email detailed view
function detail_view(email) {
  console.log(email);
  console.log(email.archived);
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //  Set the fields
  document.querySelector('#email-from').innerHTML = email.sender;
  document.querySelector('#email-to').innerHTML = email.recepients;
  document.querySelector('#email-subject').innerHTML = email.subject;
  document.querySelector('#email-timestamp').innerHTML = email.timestamp;

  // Buttons
  document.querySelector('#reply').addEventListener('click', () => reply(email));
  const archive_btn = document.querySelector('#archive');
  // Set the button's text
  if (email.archived === false) {
    archive_btn.innerHTML = 'Archive';
  } else {
    archive_btn.innerHTML = 'Unarchive';
  }
  archive_btn.addEventListener('click', () => {
    if (archive_btn.innerHTML === 'Archive') {
      archive(email, value=true);
      archive_btn.innerHTML = 'Unarchive';
    } else if (archive_btn.innerHTML === 'Unarchive') {
      archive(email, value=false);
      archive_btn.innerHTML = 'Archive';
    }
  });

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  });

  document.querySelector('#email-body').innerHTML = email.body;
}

// Reply button
function reply(email) {

}

// Wierd Error where every previous put metho is requested again again

// Archive button
function archive(email, value=true) {
  const options = {
    method: 'PUT',
    body: JSON.stringify({
      archived: value
    })
  };
  fetch(`/emails/${email.id}`, options);
}
