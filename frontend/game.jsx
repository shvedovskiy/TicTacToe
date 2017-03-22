const GameApp = React.createClass({
    getInitialState: function() {
        return {
            turn : 'X',
            score : { X: 0, O: 0 },
            moves : 0,
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
            wins : [7, 56, 448, 73, 146, 292, 273, 84]
        }
    },

    win: function(score) {
        for (let i = 0; i < this.props.wins.length; i++)
            if ((this.props.wins[i] & score) === this.props.wins[i])
                return true;
        return false;
    },

    set: function(indicator) {
        let td = this.refs[indicator];

        if (td.props.children.length !== 0)
            return;

        this.props.tiles[indicator] = this.props.turn;
        this.props.moves++;
        this.props.score[this.props.turn] += indicator;

        this.setState(this.props);

        if (this.win(this.props.score[this.props.turn])) {
            if (this.props.turn === 'X') {
                if (this.props.players[0] === playerName)
                    endGame(playerName);
                else
                    endGame(this.props.players[1]);
            } else {
                if (this.props.players[1] === playerName)
                    endGame(playerName);
                else
                    endGame(this.props.players[0]);
            }
        } else if (this.props.moves === 9) {
            endGame('Tied');
        } else {
            this.props.turn = this.props.turn === 'X' ? 'O' : 'X';
            move(this.props);
        }
    },

    render: function() {
        let rows = [];
        let indicator = 1;

        for (let i = 0; i < 3; i++) {
            let cols = [];
            for (let j = 0; j < 3; j++) {
                let options = {
                    key: indicator,
                    ref: indicator,
                    className: 'tile',
                };

                if (this.props.turn === 'X') {
                    if (this.props.players[0] === playerName) {
                        options['onClick'] = this.set.bind(this, indicator);
                        options['onTouchStart'] = this.set.bind(this, indicator);
                    }
                } else {
                    if (this.props.players[1] === playerName) {
                        options['onClick'] = this.set.bind(this, indicator);
                        options['onTouchStart'] = this.set.bind(this, indicator);
                    }
                }
                cols.push(<td {...options}>{this.props.tiles[indicator]}</td>);
                indicator += indicator;
            }
            rows.push(<tr className="row" key={i}>{cols}</tr>);
        }

        return (
            <div className="row">
                <div className="col-md-8 col-md-offset-2">
                    <h2>Играем...</h2>
                    <hr/>
                    <div className="game">
                        <div className={this.props.turn === 'X' ? "name active" : "name"} id="x-player" key="x-player">
                            {this.props.players[0] ? 'X: ' + this.props.players[0] : 'X: '}
                            </div>
                        <div className={this.props.turn === 'O' ? "name active" : "name"} id="o-player" key="o-player">
                            {this.props.players[1] ? 'O: ' + this.props.players[1] : 'O: '}
                            </div>
                        <table className="game-table" key="tableKey">
                            <tbody>{rows}</tbody>
                        </table>
                    </div>
                    <hr/>
                </div>
            </div>
        );
    }
});

const MessageForm = React.createClass({
    getInitialState: function () {
        return { text: '' };
    },

    handleSubmit: function (e) {
        e.preventDefault();
        let message = { user: this.props.user, text: this.state.text };
        this.props.onMessageSubmit(message);
        this.setState({ text: '' });
    },

    changeHandler: function (e) {
        this.setState({ text: e.target.value });
    },

    render: function () {
        return (
            <form className="input-group message-form" onSubmit={this.handleSubmit}>
                <input type="text" className="form-control" value={this.state.text} autoComplete="off" placeholder='Новое сообщение' onChange={this.changeHandler}/>
                <span className='input-group-btn'>
                    <button className='btn btn-default' type='submit'>Отправить</button>
                </span>
            </form>
        );
    },
});

const Message = React.createClass({
    render: function () {
        return(
            <li className="message">
                <strong>{this.props.user}</strong>
                <span>{this.props.text}</span>
            </li>
        );
    }
});

const MessageList = React.createClass({
    render: function () {
        return(
            <ul id="chat">
                {
                    this.props.messages.map((message, i) => {
                        return (<Message key={i} user={message.user} text={message.text}/>);
                    })
                }
            </ul>
        );
    }
});

const ChatApp = React.createClass({
    getInitialState: function () {
        return {
            users: [],
            messages: [],
            text: ''
        };
    },

    componentDidMount: function() {
        sock.on('init', this._init);
        sock.on('chat message', this._messageReceive);
    },

    _init: function (data) {
        let {users, name} = data;
        this.setState({ users, user: name });
    },

    _messageReceive: function (msg) {
        let {messages} = this.state;
        messages.push(msg);
        this.setState({messages});
    },

    handleMessageSubmit: function (msg) {
        let {messages} = this.state;
        messages.push(msg);
        this.setState({messages});
        sock.emit('chat message', msg);
    },

    render: function() {
        return(
            <div className="row">
                <div className="col-md-8 col-md-offset-2">
                    <h4>Игровой чат</h4>
                    <MessageForm onMessageSubmit={this.handleMessageSubmit} user={this.state.user}/>
                    <MessageList messages={this.state.messages}/>
                </div>
            </div>
        );
    }
});

const App = React.createClass({
    render: function () {
        return (
            <div className="app">
                <GameApp turn={this.props.turn} score={this.props.score} moves={this.props.moves} wins={this.props.wins} tiles={this.props.tiles} players={this.props.players} />
                <ChatApp/>
            </div>
        )
    }
});

React.render(<App/>, document.getElementById('game-page'));

function render(turn, score, moves, wins, tiles, players) {
    // React.render(
    //     <GameApp turn={turn} score={score} moves={moves} wins={wins} tiles={tiles} players={players} />,
    //     document.querySelector('.app')
    // );
    React.render(<App turn={turn} score={score} moves={moves} wins={wins} tiles={tiles} players={players} />, document.getElementById('game-page'));
}
