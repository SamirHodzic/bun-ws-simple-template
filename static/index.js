const socket = new WebSocket('ws://localhost:3000');

const addMessage = (message) => {
  const el = document.createElement('div');
  el.classList.add('message');
  const msg = document.createElement('div');
  msg.classList.add('message-content');
  const usr = document.createElement('div');
  usr.classList.add('user');
  usr.appendChild(document.createTextNode(message.username));
  const txt = document.createElement('div');
  txt.classList.add('text');
  txt.appendChild(document.createTextNode(message.text));
  msg.appendChild(usr);
  msg.appendChild(txt);
  el.appendChild(msg);

  const messagesEl = document.getElementById('messages');
  messagesEl.appendChild(el);
  messagesEl.scrollTo(0, messagesEl.scrollHeight);
};

const setMessages = (messages) => {
  document.getElementById('messages').innerHTML = '';
  messages.forEach((message) => addMessage(message));
};

const addUser = (username) => {
  const el = document.createElement('div');
  el.classList.add('user-item');
  const usr = document.createElement('div');
  usr.classList.add('user-name');
  usr.appendChild(document.createTextNode(username));
  el.setAttribute('id', username);
  el.appendChild(usr);
  document.getElementById('users').appendChild(el);
};

const removeUser = (username) => {
  document.getElementById(username).outerHTML = '';
};

const setUsers = (usernames) => {
  document.getElementById('users').innerHTML = '';
  usernames.forEach((username) => addUser(username));
};

socket.addEventListener('message', (e) => {
  const event = JSON.parse(e.data);

  switch (event.type) {
    case 'NEW_MESSAGE':
      addMessage(event.data);
      break;
    case 'ALL_MESSAGES':
      setMessages(event.data);
      break;
    case 'NEW_USER':
      addUser(event.data);
      break;
    case 'REMOVE_USER':
      removeUser(event.data);
      break;
    case 'ALL_USERS':
      setUsers(event.data);
      break;
  }
});

document.getElementById('form').addEventListener('submit', (event) => {
  event.preventDefault();
  const el = event.target.getElementsByTagName('input')[0];
  if (el.value.trim() !== '') {
    socket.send(
      JSON.stringify({
        text: el.value,
      })
    );

    el.value = '';
  }
});
