/* Клиентский сценарий */
$(function() {
    let url = $('#url').text().split('/'); // текущий URL страницы

    soundManager.setup({
        url: './public/javascripts/lib',
        onready: function() {
            let mySound = soundManager.createSound({
                id: 'mySound',
                url: '../audio/step.mp3',
                autoLoad: true,
                autoPlay: false,
                volume: 50
            });
        },
        ontimeout: function() {}
    });

    $('#play-btn').click(() => {
        playerName = $('#player-name-input').val().trim();
        if (playerName) {
            sock.emit('play', playerName);
        }
    });

    $('#play-again-btn').click(() => {
        window.location = url[0] + '//' + url[2];
    });

    // Отправка новоего сообщения в чат:
    $('form').submit(() => {
        sock.emit('chat message', $('#message-input').val(), playerName);
        $('#message-input').val('');
        return false;
    });

    // Новое сообщение в чате комнаты:
    sock.on('chat message', (m, name)  =>
        $('#chat').prepend($('<li>').text(name + ' : ' + m))
    );

    // Определить, обычный ли это игрок, или приглашенный:
    sock.on('check player', (playerName) => {
        let href = $(location).prop('href');
        if (href.substring(0, href.length - 1).split('/').length <= 3) {
            sock.emit('add player', playerName);
            redirect($('#invite-page'));
            $('#url').append(sock.id).append('/');
        } else {
            sock.emit('add invited player', playerName, href.substring(0, href.length-1).split('/')[3]);
            redirect($('#waiting-page'));
        }
    });

    // Opponent joined room
    sock.on('joined room', (state) => {
        if (state.players.length > 1) {
            render(state.turn, state.score, state.moves, state.wins, state.tiles, state.players);
            redirect($('#game-page'));
        }
    });

    // Принятие хода от игрока:
    sock.on('move', (state) =>
        render(state.turn, state.score, state.moves, state.wins, state.tiles, state.players)
    );

    // Соперник покидает игру (либо отключается):
    sock.on('player left', () => {
        $('#result-text').html('Соперник покинул игру');
        redirect($('#result-page'));
        sock.emit('leave room');
    });

    // Достижение конца игры, вывод результатов:
    sock.on('end game', (result) => {
        if (result === playerName)
            $('#result-text').html('Вы победили!');
        else if (result === 'Tied')
            $('#result-text').html('Ничья!');
        else
            $('#result-text').html('Вас обыграли');
        redirect($('#result-page'));
        sock.emit('leave room');
    });

    // Вход по несуществующей инвайт-ссылке:
    sock.on('no game', (game) => {
        $('#result-text').html('Не удалось найти игру ' + game);
        redirect($('#result-page'));
    });

    // Вначале переходим на страницу ввода ника:
    redirect($('#enter-page'));

    function redirect(page) {
        $('.page').css({ 'display': 'none' });
        page.css({ 'display': 'block' });
    }
});

// Звуковое оформление хода игрока:
$(document).delegate('td', 'click', () => soundManager.play('mySound'));

function move(state) {
    sock.emit('move', state);
}

function endGame(result) {
    sock.emit('end game', result);
}