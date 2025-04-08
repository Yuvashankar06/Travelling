document.addEventListener("DOMContentLoaded", function () {
  // Contact Form
  const form = document.getElementById('contactForm');
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const subject = document.getElementById('subject');
  const message = document.getElementById('message');
  const status = document.getElementById('formStatus');
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("nav");

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const validateField = (field, condition, errorMsg) => {
        return new Promise((resolve, reject) => {
          if (!condition) {
            field.setCustomValidity(errorMsg);
            field.reportValidity();
            reject(errorMsg);
          } else {
            field.setCustomValidity('');
            resolve();
          }
        });
      };

      try {
        await Promise.all([
          validateField(name, name.value.trim().length >= 2, 'Name must be at least 2 characters.'),
          validateField(email, /\S+@\S+\.\S+/.test(email.value), 'Enter a valid email address.'),
          validateField(subject, subject.value.trim() !== '', 'Subject is required.'),
          validateField(message, message.value.trim().length >= 2, 'Message must be at least 10 characters.')
        ]);

        const response = await fetch('https://67f015332a80b06b8896d88f.mockapi.io/User', {
          method: 'POST',
          body: JSON.stringify({
            name: name.value,
            email: email.value,
            subject: subject.value,
            message: message.value
          }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8'
          }
        });

        if (response.ok) {
          status.textContent = 'Message sent successfully!';
          form.reset();
        } else {
          status.textContent = 'Something went wrong. Please try again.';
        }
      } catch (err) {
        console.log(err);
      }
    });
  }

  // Chatbot
  const chatBox = document.getElementById('chatBox');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  if (sendBtn && chatInput && chatBox) {
    sendBtn.addEventListener('click', () => {
      const msg = chatInput.value.trim();
      if (msg === '') return;

      appendMessage('user', msg);
      chatInput.value = '';

      showTypingIndicator();

      simulateBotResponse(msg)
        .then(response => {
          hideTypingIndicator();
          appendMessage('bot', response);
        })
        .catch(error => {
          hideTypingIndicator();
          appendMessage('bot', 'Oops! Something went wrong.');
          console.error(error);
        });
    });

    function appendMessage(sender, message) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
      msgDiv.textContent = message;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTypingIndicator() {
      const typingIndicator = document.createElement('div');
      typingIndicator.classList.add('typing-indicator');
      typingIndicator.innerHTML = '<span></span><span></span><span></span>';
      chatBox.appendChild(typingIndicator);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function hideTypingIndicator() {
      const typingIndicator = chatBox.querySelector('.typing-indicator');
      if (typingIndicator) typingIndicator.remove();
    }

    function simulateBotResponse(userMessage) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const msg = userMessage.toLowerCase();

          let reply = "I'm not sure how to respond to that. Could you please rephrase?";

          if (msg.includes('hello') || msg.includes('hi')) {
            reply = "Hello! How can I assist you today?";
          } else if (msg.includes('help')) {
            reply = "Sure! Please tell me more about the issue you're facing.";
          } else if (msg.includes('email')) {
            reply = "You can reach us at support@travelweb.com.";
          } else if (msg.includes('thanks') || msg.includes('thank you')) {
            reply = "You're welcome! Let me know if there's anything else.";
          } else if (msg.includes('contact')) {
            reply = "You can use the form to send us a message!";
          }

          resolve(reply);
        }, 1200);
      });
    }
  }

  function animateMarker() {
    return new Promise((resolve) => {
      const marker = document.getElementById('customMarker');
      marker.style.animation = 'none';
      // Force reflow to restart animation
      void marker.offsetWidth;
      marker.style.animation = 'bounceIn 1s ease forwards';
  
      setTimeout(() => {
        resolve("Marker animation complete");
      }, 1000); // match animation duration
    });
  }

  animateMarker().then((msg) => {
    console.log(msg);
  });
});
