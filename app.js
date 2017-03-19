/* Серверный сценарий */
let express        = require('express');
let path           = require('path');
let favicon        = require('serve-favicon');
let logger         = require('morgan');
let cookieParser   = require('cookie-parser');
let bodyParser     = require('body-parser');
let methodOverride = require('method-override');
let underscore     = require('underscore');

let app    = express();
let server = require('http').Server(app);
let io     = require('socket.io')(server);

let index      = require('./routes/index');
let games      = [];
let players    = [];
let numPlayers = 0;
let gamesCount = 0;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(methodOverride());
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/*', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

io.on('connection', (sock) => {
    let room = null;
    // Нажатие кнопки "играть":
    sock.on('play', (playerName) => {
        console.log('Player ' + playerName + ' press play');
        sock.emit('check player', playerName);
    });

    // Регистрация нового игрока:
    sock.on('add player', (playerName) => {
        console.log('New main player: ' + playerName);
        sock.playerName = playerName;
        players.push({
            playerName: playerName,
            socketID: sock.id
        });
        numPlayers++;
        room = 'game-' + sock.id;
        console.log('New room for main player: ' + room);
        sock.join(room);
        sock.room = room;

        /*
        * Реализация логики игры:
        * Игровое поле размера 3x3 имеет 9 ячеек, каждая из которых, слева направо и снизу вверх,
        * помечена числом, соответствующим двойке в степени порядкового номера ячейки (отсчет
        * ведется с нуля).
        * Таким образом, каждая ячейка представляется соотв. битом в 9-битной строке, а состояния
        * игроков в каждый момент времени представляются 9-битными значениями (св-ва объекта score),
        * составленными из ячеек, на которых он ходил.
        * Победителя можно определить, проверив его 9-битное значение на соответствие одному из
        * выигрышных значений (массив wins).
        * Выигрышное значение является суммой трех ячеек, составляющих выигрышную комбинацию игры,
        * например первая строка со значением 7, составленная из ячеек 1, 2 и 4.
        * */
        let game = {
            turn: 'X',
            score: { X: 0, O: 0 },
            moves: 0,
            tiles: {
                1: '',
                2: '',
                4: '',
                8: '',
                16: '',
                32: '',
                64: '',
                128: '',
                256: ''
            },
            wins: [7, 56, 448, 73, 146, 292, 273, 84],
            players: [],
            id: room
        };
        game.players.push(sock.playerName);
        games.push(game);
        gamesCount++;
        sock.emit('joined room', game);
    });

    // Регистрация приглашенного игрока:
    sock.on('add invited player', (playerName, id) => {
        console.log('New invited player: ' + playerName);
        sock.playerName = playerName;
        players.push({
            playerName: playerName,
            socketID: sock.id
        });
        numPlayers++;
        let game;
        let found = false;
        for (let i = 0; i < games.length; i++) {
            console.log('Available game: ' + games[i].id);
            if (games[i].id === ('game-' + id)) {
                game = games[i];
                found = true;
                break;
            }
        }
        if (found === true) {
            game.players.push(sock.playerName);
            let room = game.id;
            console.log('Invited player: ' + sock.playerName + ' joining to room ' + room);
            sock.join(room);
            sock.room = room;
            sock.emit('joined room', game);
            io.to(sock.room).emit('joined room', game);
        } else {
            sock.emit('no game', 'game-' + id);
        }
    });

    // Ход игрока:
    sock.on('move', (state) => io.to(sock.room).emit('move', state));

    // Игрок покидает игру:
    sock.on('leave room', () => {
        console.log(sock.playerName + 'leaves room ' + sock.room);
        sock.leave(sock.room)
    });

    // Окончание игры:
    sock.on('end game', (result) => {
        console.log('Game ended: ' + result);
        io.sockets.in(sock.room).emit('end game', result);
        sock.leave(sock.room);
    });

    // Дисконнект пользователя:
    sock.on('disconnect', () => {
        console.log('*********** Player Left ****************');
        console.log(sock.id + ' | ' + sock.playerName);
        console.log('****************************************');

        if ('room' in sock) {
            for (let i = 0; i < games.length; i++) {
                if (sock.room === games[i].id) {
                    games.splice(i, 1);
                    break;
                }
            }
            io.to(sock.room).emit('player left');
        }
        for (let i = 0; i < players.length; i++) {
            if (players[i].playerName === sock.playerName) {
                players.splice(i, 1);
                --numPlayers;
                break;
            }
        }
    });
    // Новое сообщение в чате:
    sock.on('chat message', (m, name) =>
        io.to(sock.room).emit('chat message', m, name)
    );
});

module.exports.app = app;
module.exports.server = server;
