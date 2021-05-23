// DISCLAMER: just now i noticed that i don't stick to the camelCase convention
// sorry if that makes any trouble ;<
document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  check_fields()
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

  // Display any messages in the local storage
    document.querySelector('#form-message').innerHTML = localStorage.getItem('message');
    localStorage.setItem('message', '');
}

// Send email
function send_email() {
  // Store the email data
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // for some reason both ',' and ', ' work :D
  if (validateEmail(recipients.split(', ')) === true) {
    // Request to the API
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
      .then(response => response.json())
      .then(result => {
        // console.log(result);

        // Redirect
        load_mailbox('sent');
      })
      .catch(e => {
        console.log(e);
      });
  } else {
    localStorage.setItem('message', 'Invalid Email.')
  }
}

// Not my own function, mistake of mine is to not have delved in regex :<
// Taken from here https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email_arr) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  for (i=0; i< email_arr.length; i++) {
    if (re.test(String(email_arr[i].toLowerCase())) === false) {
      return false;
    }
  }
  return true;
}

// Checks the recipient and subject fields -> must not be empty
function check_fields() {
  // Query for the fields
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');

  // Disable the submit button if the fields are not prefilled
  if (recipients.value !== '' && subject.value !== '') {
    document.querySelector('#btn-submit').disabled = false;
  }
  
  // Not the most elegant solution
  // recipient and subject flags to togle the submit button
  let r_flag = false;
  let s_flag = false;
  
  // Check email and subject
  recipients.onkeyup = () => {
    if (recipients.value !== '') {
      r_flag = true;
    } else {
      r_flag = false;
    }
    check_flags()
  }
  subject.onkeyup = () => {
    if (subject.value !== '') {
      s_flag = true;
    } else {
      s_flag = false;
    }
    check_flags()
  }

  function check_flags() {
    if (r_flag === true && s_flag === true) {
      document.querySelector('#btn-submit').disabled = false;
    } else {
      document.querySelector('#btn-submit').disabled = true;
    }
  }
}

// Single email detailed view
function detail_view(email, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //  Set the fields
  document.querySelector('#email-from').innerHTML = email.sender;
  document.querySelector('#email-to').innerHTML = email.recipients;
  document.querySelector('#email-subject').innerHTML = email.subject;
  document.querySelector('#email-timestamp').innerHTML = email.timestamp;

  const reply_btn = document.querySelector('#reply');
  reply_btn.removeEventListener('click', reply);
  const archive_btn = document.querySelector('#archive');
  
  // Check if the request is from 'sent' mailbox
  if (mailbox !== 'sent') {
    // Reply button
    reply_btn.style.display = 'inline';
    reply_btn.addEventListener('click', () => reply(email));

    // Display the archive button
    archive_btn.style.display = 'inline';
    
    // Set the archive button's text
    if (email.archived === false) {
      archive_btn.innerHTML = 'Archive';
    } else {
      archive_btn.innerHTML = 'Unarchive';
    }
    
    // The actual call to archive/unarchive an email
    archive_btn.onclick = () => {
      archive(email);
    }
    
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
    // Hide the buttons
    archive_btn.style.display = 'none';
    document.querySelector('#reply').style.display = 'none';
  }

  document.querySelector('#email-body').innerHTML = email.body;
}

// Reply button
function reply(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Prefilling the form
  recipients.value = email.sender;
  if (email.subject.slice(0,4) === 'Re: ') {
    subject.value = email.subject;
  } else {
    subject.value = 'Re: ' + email.subject;
  }
  body.value = '\n\n' + `On ${email.timestamp} ${email.sender} wrote:\n` + email.body;
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
  // the mail doesn't get moved to the appropriate mailbox in time
  setTimeout(load_mailbox, 100, 'inbox');
  // load_mailbox('inbox');
}

// TODO - finish
