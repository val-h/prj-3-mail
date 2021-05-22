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
        mail_container.addEventListener('click', () => detail_view(crnt_email, mailbox));

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
function detail_view(email, mailbox) {
  console.log('Email', email);
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //  Set the fields
  document.querySelector('#email-from').innerHTML = email.sender;
  // Returns an Array
  document.querySelector('#email-to').innerHTML = email.recipients;
  document.querySelector('#email-subject').innerHTML = email.subject;
  document.querySelector('#email-timestamp').innerHTML = email.timestamp;

  // Buttons
  document.querySelector('#reply').addEventListener('click', () => reply(email));
  const archive_btn = document.querySelector('#archive');

  console.log(mailbox);
  // Check if the request is from 'sent' mailbox
  if (mailbox !== 'sent') {
    // Display the archive button
    archive_btn.style.display = 'inline';
    
    // Set the archive button's text
    if (email.archived === false) {
      archive_btn.innerHTML = 'Archive';
    } else {
      archive_btn.innerHTML = 'Unarchive';
    }

    archive_btn.onclick = () => {
      archive(email);
    }
    
    // // Probably optional, make the redirect work ;d
    // // Add the click behaviour for archiving
    // archive_btn.onclick = () => {
    //   if (archive_btn.innerHTML === 'Archive') {
    //     archive_btn.innerHTML = 'Unarchive';
    //   } else if (archive_btn.innerHTML === 'Unarchive') {
    //     archive_btn.innerHTML = 'Archive';
    //   }
    //   archive(email);
    // }

    // Change the read property to true
    if (email.read == false) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true,
        })
      });
    }
  } else {
    // Hide the archive button
    archive_btn.style.display = 'none';
  }

  document.querySelector('#email-body').innerHTML = email.body;
}

// Reply button
function reply(email) {

}

// Archive button
function archive(email) {
  const options = {
    method: 'PUT',
    body: JSON.stringify({
      archived: !email.archived
    })
  };
  fetch(`/emails/${email.id}`, options);
  
  // setTimeout is used because fetch's response comes with a delay and 
  // the  mail doesn't get moved to the appropriate mailbox in time
  setTimeout(load_mailbox, 100, 'inbox');
  // load_mailbox('inbox');
}
