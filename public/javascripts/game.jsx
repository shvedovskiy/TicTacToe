const App = React.createClass({
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
            <div className="app">
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
        );
    }
});

function render(turn, score, moves, wins, tiles, players) {
    React.render(
        <App turn={turn} score={score} moves={moves} wins={wins} tiles={tiles} players={players} />,
        document.getElementById('game')
    );
}
