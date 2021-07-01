// Variáveis

var chat_typping = false;
var chat_timer = null;
var chat_messages = [];
var chat_message_idx = 0;
var chat_idx_message = 0;

// Eventos

window.addEventListener('message', (event) => {
	var data = event.data;

	if (data.type == 'chat') {
		if (data.command == 'open') {
			openChat(400);
		}
		if (data.command == 'add') {
			addChat(data.author, data.color, data.text);
		}
		if (data.command == 'clear') {
			clearChat();
		}
	}
	if (data.type == 'box') {
		sendBox(data.title, data.message, data.input, data.submit, data.cancel);

		box_key = data.key;
	}
});

window.addEventListener('keyup', function(event) {
	var which = event.which;

	if (chat_typping == true) {
		if (which == 13 && chatFocus) { // Enter
			var text = chat_input.value;

			if (text.trim()) {
				sendChat(text);
			}
		}
		if (which == 38) { // Cima
			if (chat_message_idx > 0) {
				chat_idx_message = (chat_idx_message - 1);

				if (chat_idx_message < 0) {
					chat_idx_message = (chat_message_idx - 1);
				}
				chat_input.value = chat_messages[chat_idx_message];
			}
		}
		if (which == 40) { // Baixo
			if (chat_message_idx > 0) {
				chat_idx_message = (chat_idx_message + 1);

				if (chat_idx_message > (chat_message_idx - 1)) {
					chat_idx_message = 0;
				}
				chat_input.value = chat_messages[chat_idx_message];
			}
		}
		if (which == 27) { // Esc
			closeChat(300);
		}
	}
});

// Funções (Chat)

function openChat(time) {
	chat.style.animation = 'FadeIn ' + time + 'ms forwards';
	chat_input.focus();

	chat_typping = true;
}

function sendChat(text) {
	$.post('http://servidor/chat:send', JSON.stringify({
		text: text
	}));

	chat_messages[chat_message_idx] = text;

	if (chat_message_idx > 19) {
		chat_messages[(chat_message_idx - 20)] = '';

		if (chat_message_idx > 39) {
			for (var i = 0; i < 20; ++i) {
				chat_messages[i] = chat_messages[(i + 20)];
				chat_messages[(i + 20)] = null;
			}
		}
	}
	chat_message_idx = (chat_message_idx + 1);
	chat_idx_message = chat_message_idx;

	chat_input.value = '';
}

function addChat(author, color, text) {
	if (chat_typping == false) {
		chat.style.animation = 'FadeIn 1s forwards';

		if (chat_timer) { clearTimeout(chat_timer); }

		chat_timer = setTimeout(function() {
			if (chat_typping == false && chat.style.opacity < 1.0) {
				chat.style.animation = 'FadeOut 1s forwards';
			}
		}, 7000);
	}
	chat_space.innerHTML += "<span style='color: #" + color.toString(16) + "'>" + (author ? (author + " diz: " + text) : text) + "</span><br>";
	chat_space.scrollTop = chat_space.scrollHeight;
}

function clearChat() {
	if (chat_typping == false) {
		chat.style.animation = 'FadeIn 1s forwards';

		if (chat_timer) { clearTimeout(chat_timer); }

		chat_timer = setTimeout(function() {
			if (chat_typping == false && chat.style.opacity < 1.0) {
				chat.style.animation = 'FadeOut 1s forwards';
			}
		}, 7000);
	}
	chat_space.innerHTML = "<span style='color: #B2B2B2'>Seu chat foi limpo com sucesso!</span><br>";
}

function closeChat(time) {
	chat.style.animation = 'FadeOut ' + time + 'ms forwards';

	chat_input.value = '';
	chat_input.blur();

	chat_typping = false;

	$.post('http://servidor/chat:close', JSON.stringify({}));
}

// Funções (Box)

function sendBox(title, message, input, submit, cancel) {
	box_title.innerText = title;
	box_message.innerText = message;

	if (input == true) {
		box_input.style.display = 'block';
	}
	else if (input == 'password') {
		box_input.style.display = 'block';
		box_input.setAttribute('type', 'password');
	}
	box_submit.innerText = submit;
	box_cancel.innerText = cancel;

	box.style.display = 'block';
}

function _boxSubmit() {
	if (box_key) {
		if (box_input.style.display == 'block' && !box_input.value.trim()) {
			return false;
		}
		$.post('http://servidor/box:submit', JSON.stringify({
			key: box_key,
			input: box_input.value
		}));

		box_key = null;
	}
	closeBox();
}

function _boxCancel() {
	if (box_key) {
		$.post('http://servidor/box:cancel', JSON.stringify({
			key: box_key
		}));

		box_key = null;
	}
	closeBox();
}

function closeBox() {
	box_title.innerText = '';
	box_message.innerText = '';

	if (box_input.style.display == 'block') {
		box_input.value = '';
		box_input.setAttribute('type', 'text');
	}
	box_input.style.display = 'none';

	box_submit.innerText = '';
	box_cancel.innerText = '';

	box.style.display = 'none';
}
