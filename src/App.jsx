import React from 'react';
import ReactDOM from 'react-dom';
import styles from './App.css';
import { HelpBlock, Label, Form, FormGroup, ControlLabel, ToggleButtonGroup, ToggleButton, ButtonGroup, Panel, ListGroup, ListGroupItem, Navbar, Nav, NavItem, NavDropdown, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal, Grid, Row, Col } from 'react-bootstrap';
import Select from 'react-select'

import { AppNavbar } from './AppNavbar.jsx';
import { List } from 'immutable';
import { Board, MoveTable } from './ChessApp.jsx';

import { GameClient, startingFen, gameStatus } from './helpers.jsx'
import { getBest } from './engine.js'


/* The window to enter moves. There are currently two options:
(1) Click on buttons, one for each move
(2) Enter the move in a text field and hit enter - disabled by default

Through trial and error I noticed that the first option simply works better, especially
when using a phone.
*/
export class MoveEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '', warning: null }
  }
  focus = () => {
    let node = ReactDOM.findDOMNode(this.refs.inputNode);
    if (node && node.focus instanceof Function) {
      node.focus();
    }
  }
  componentDidMount() {
    this.focus();
  }
  setValue = value => this.setState({ value: value })
  onChange = e => this.setValue(e.target.value)
  handleKeyPress = target => {
    if (target.charCode == 13) {
      this.submit();
    }
  }
  checkMove = (type, moves) => {
    var arrMoves = []
    moves.map(move => {
      if (move.charAt(0) == type || (type == 'K' && move.charAt(0) == 'O')) {
        arrMoves.push(move)
      }
    })

    return arrMoves.sort()
  }

  checkPawnMove = (moves) => {
    var arrMoves = []
    moves.map(move => {
      if (move.charAt(0) != 'N' && move.charAt(0) != 'B' && move.charAt(0) != 'Q' && move.charAt(0) != 'R' && move.charAt(0) != 'K' && (move.charAt(0) != 'O')) {
        arrMoves.push(move)
      }
    })
    return arrMoves.sort()
  }

  submit = () => this.makeMove(this.state.value);
  makeMove = move => {
    const moveValid = this.props.gameClient.isMoveValid(move);
    if (moveValid) {
      this.props.makeMove(move);
      this.setState({ value: '', warning: null })
    }
    else {
      this.showWarning("Move is not valid");
    }
  }
  componentDidUpdate = (prevProps, prevState, snapshot) => {
    this.focus()
  }
  showWarning = warning => this.setState({ warning: warning });
  /* Display the move according to the app settings.
  For instance, if the `showIfCheck` setting is `false`, then remove the "+" from any move
  */
  displayMove = move => {
    var formattedMove = move;
    if (!this.props.parentState.showIfMate) {
      formattedMove = formattedMove.replace("#", "+");
    }
    if (!this.props.parentState.showIfTakes) {
      formattedMove = formattedMove.replace("x", "");
    }
    if (!this.props.parentState.showIfCheck) {
      formattedMove = formattedMove.replace("+", "");
    }
    return formattedMove
  }
  render = () => {
    const moves = this.props.gameClient.client.moves();

    const nMoves = this.checkMove('N', this.props.gameClient.client.moves())
    const bMoves = this.checkMove('B', this.props.gameClient.client.moves())
    const pMoves = this.checkPawnMove(this.props.gameClient.client.moves())
    const qMoves = this.checkMove('Q', this.props.gameClient.client.moves())
    const kMoves = this.checkMove('K', this.props.gameClient.client.moves())
    const rMoves = this.checkMove('R', this.props.gameClient.client.moves())

    const buttonForMove = move => (
      <Col key={move} xs={3} md={2}>
        <div className={styles.moveButton} onClick={() => this.props.makeMove(move)}>{this.displayMove(move)}</div>
      </Col>
    )
    const input = !this.props.enterMoveByKeyboard ?
      <div>
        {pMoves.length > 0 && (
          <p>
            <h4 style={{ textAlign: 'center' }}>Peões</h4>
            <Row style={{ marginLeft: 0, marginRight: 10 }}>
              {pMoves.map(buttonForMove)}
            </Row>
          </p>
        )}
        {nMoves.length > 0 && (
          <p>
            <h4 style={{ textAlign: 'center' }}>Cavalos</h4>
            <Row style={{ marginLeft: 0, marginRight: 10 }}>
              {nMoves.map(buttonForMove)}
            </Row>
          </p>
        )}
        {bMoves.length > 0 && (
          <p>
            <h4 style={{ textAlign: 'center' }}>Bispos</h4>
            <Row style={{ marginLeft: 0, marginRight: 10 }}>
              {bMoves.map(buttonForMove)}
            </Row>
          </p>
        )}
        {rMoves.length > 0 && (
          <p>
            <h4 style={{ textAlign: 'center' }}>Torres</h4>
            <Row style={{ marginLeft: 0, marginRight: 10 }}>
              {rMoves.map(buttonForMove)}
            </Row>
          </p>
        )}
        {qMoves.length > 0 && (
          <p>
            <h4 style={{ textAlign: 'center' }}>Dama</h4>
            <Row style={{ marginLeft: 0, marginRight: 10 }}>
              {qMoves.map(buttonForMove)}
            </Row>
          </p>
        )}
        {kMoves.length > 0 && (
          <p>
            <h4 style={{ textAlign: 'center' }}>Rei</h4>
            <Row style={{ marginLeft: 0, marginRight: 10 }}>
              {kMoves.map(buttonForMove)}
            </Row>
          </p>
        )}
      </div>
      :
      <div>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          <Col sm={4} smOffset={4}>
            <FormControl
              bsSize="large"
              ref="inputNode"
              type="text"
              onChange={this.onChange}
              onKeyPress={this.handleKeyPress}
              value={this.state.value}
            />
          </Col>
          <Col sm={2}>
            <Button bsSize="large" id="submitButton" onClick={this.submit}>Submit</Button>
          </Col>
        </Row>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          <Col sm={6} smOffset={4}>
            <HelpBlock bsStyle="warning" style={{ color: "red" }} > {this.state.warning} </HelpBlock>
          </Col>
        </Row>
      </div>
    return (<div>{input}</div>)
  }
}


const resetState = () => {
  const gameClient = new GameClient();
  return {
    moves: List([])
    , gameClient: gameClient
    , colorToMoveWhite: true
    , showBoard: false
    , showType: "make"
  }
}

/* Obtaining the starting state for a new game.
The starting state is not the same as the reset state, because we want
some properties, e.g. the Stockfish level, to persist throughout games.
The reset state does not contain these properties, so we need to add them
here.
*/
var startingState = () => {
  var state = resetState()
  state['ownColorWhite'] = true
  state['skillLevel'] = 0
  state['showIfMate'] = true
  state['showIfTakes'] = true
  state['showIfCheck'] = true
  state['enterMoveByKeyboard'] = false;
  return state
}


/* Get the stockfish levels in terms of Elo rating.
Stockfish levels range from 0 (1100 Elo) to 20 (3100 Elo)
These are really very rough heuristics, but should be close enough for
our purposes.
*/
const getStockfishLevels = () => {
  var values = [];
  const numLevels = 20;
  const minElo = 1100;
  const maxElo = 3100;
  for (var i = 0; i <= numLevels; i++) {
    const elo = Math.floor((minElo + (maxElo - minElo) * (i / numLevels)) / 100) * 100;
    values.push({ value: i, label: elo })
  }
  return values
}

/* Displays the window to change settings */
export class SettingsWindow extends React.Component {
  constructor(props) {
    super(props);
  }
  render = () => {
    const values = getStockfishLevels()

    /* Obtain the toggle button to turn a property on or off */
    const buttonForProperty = (name, display) => {
      return (
        <Row>
          <Col xs={6}>
            <div>{display}</div>
          </Col>
          <Col xs={6}>
            <ToggleButtonGroup justified type="radio" name="options" value={this.props.parentState[name]} onChange={value => this.props.setProperty(name, value)}>
              <ToggleButton value={true}>Sim</ToggleButton>
              <ToggleButton value={false}>Não</ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Row>
      )
    }

    const hr = <hr style={{ height: "2px", border: "0 none", color: "lightGray", backgroundColor: "lightGray" }} />
    const displaySettings = this.props.parentState.enterMoveByKeyboard ? null :
      <div>
        {hr}
        {buttonForProperty('showIfMate', 'Mostrar se lance é mate:')}
        {hr}
        {buttonForProperty('showIfCheck', 'Mostrar se lance é xeque:')}
        {hr}
        {buttonForProperty('showIfTakes', 'Mostrar se lance é captura:')}
      </div>

    return (
      <div>
        <Row>
          <Col xs={6}>
            <div> Rating do Stockfish (ELO): </div>
          </Col>
          <Col xs={6}>
            <Select
              clearable={false}
              value={this.props.skillLevel}
              onChange={this.props.setSkill}
              options={values}
            />
          </Col>
        </Row>
        {hr}
        <Row>
          <Col xs={6}>
            <div> Jogar de: </div>
          </Col>
          <Col xs={6}>
            <ToggleButtonGroup justified type="radio" name="options" value={this.props.ownColorWhite} onChange={this.props.setOwnColor}>
              <ToggleButton value={true}>Brancas</ToggleButton>
              <ToggleButton value={false}>Negras  </ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Row>
        {displaySettings}
      </div>
    )
  }
}

/* The statuswindow provides the status of the games and the last moves
by the player and the computer */
export class StatusWindow extends React.Component {
  constructor(props) {
    super(props);
  }
  render = () => {
    const humanText = this.props.humanMove ? (<div><span>Seu lance: </span><Label style={{ fontWeight: '400' }}>{this.props.humanMove}</Label></div>) : <span>Sua vez</span>
    const computerText = this.props.computerMove ? (<div><span>Stockfish: </span><Label style={{ fontWeight: '400' }}>{this.props.computerMove}</Label></div>) : <span>Stockfish está aguardando...</span>
    const style = { height: "50px", fontSize: "20px", textAlign: "center", marginTop: 10 }
    return (
      <div>
        <Row style={style}>
          <Label bsStyle={this.props.status[2]}> {this.props.status[1]} </Label>
        </Row>
        <Row style={style}>
          {humanText}
        </Row>
        <Row style={style}>
          {computerText}
        </Row>
      </div>
    )
  }
}

/* The main app, which pulls in all the other windows. */
export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = startingState()
  }
  reset = () => this.setState(resetState(), this.makeComputerMove)
  componentDidUpdate = (prevProps, prevState, snapshot) => {
    var table = document.getElementById("moveTable");
    if (table != null && "scrollHeight" in table) {
      console.log("scroll");
      table.scrollTop = table.scrollHeight;
    }
  }
  makeMove = move => {
    const newMoves = this.state.moves.push(move);
    this.state.gameClient.move(move, { sloppy: true });
    // If automoving is enabled, my move leads to a move by the computer.
    const nextMoveCallback = this.props.autoMove ? this.makeComputerMove : () => { }
    const newState = { moves: newMoves, colorToMoveWhite: !this.state.colorToMoveWhite }
    this.setState(newState, nextMoveCallback);
  }
  isPlayersMove = () => this.state.ownColorWhite == this.state.colorToMoveWhite
  makeComputerMove = () => {
    // Only make a computer move if it's not the player's turn
    if (this.isPlayersMove()) {
      return
    }
    const fen = this.state.gameClient.client.fen()
    getBest(this.state.skillLevel, fen, this.makeMove)
  }
  shownElement = () => {
    switch (this.state.showType) {
      case "make": return this.makeMoveElement()
      case "moves": return this.moveTableElement()
      case "board": return this.boardElement()
      case "settings": return this.settingsElement()
    }
  }
  getLastMove = (offsetTrue, offsetFalse) => () => {
    const history = this.state.gameClient.client.history()
    const offset = !this.isPlayersMove() ? offsetTrue : offsetFalse
    return history[history.length - offset];
  }
  getLastComputerMove = this.getLastMove(2, 1)
  getLastHumanMove = this.getLastMove(1, 2)
  makeMoveElement = () => (
    <div>
      <StatusWindow status={this.state.gameClient.getStatus()} humanMove={this.getLastHumanMove()} computerMove={this.getLastComputerMove()} />
      <Row>
        <MoveEntry
          enterMoveByKeyboard={this.state.enterMoveByKeyboard}
          gameClient={this.state.gameClient}
          makeMove={this.makeMove}
          parentState={this.state}
        />
      </Row>
      <Row style={{ marginTop: 20 }}>
        {this.state.gameClient.getStatus() == gameStatus.starting ? null :
          <Col xs={6} xsOffset={3}>
            <Button bsStyle="warning" block id="resetButton" onClick={this.reset}>Iniciar novo jogo</Button>
          </Col>
        }
      </Row>
    </div>
  )
  boardElement = () => <Board fen={this.state.gameClient.client.fen()} />
  handleChange = value => this.setState({ showType: value })
  moveTableElement = () => <MoveTable pgn={this.state.gameClient.client.pgn()} />
  setSkill = skill => this.setState({ skillLevel: skill.value })
  setOwnColor = isWhite => this.setState({ ownColorWhite: isWhite }, this.makeComputerMove)
  setProperty = (name, value) => {
    var newState = {}
    newState[name] = value
    this.setState(newState);
  }
  settingsElement = () => <SettingsWindow
    skillLevel={this.state.skillLevel}
    setSkill={this.setSkill}
    ownColorWhite={this.state.ownColorWhite}
    setOwnColor={this.setOwnColor}
    setProperty={this.setProperty}
    parentState={this.state}
  />
  render = () => {
    return (
      <div>
        <AppNavbar />
        <Grid>
          <Row>
            <Col sm={6} smOffset={3}>
              <Row>
                <ToggleButtonGroup justified type="radio" name="options" style={{ padding: '10px' }} value={this.state.showType} onChange={this.handleChange}>
                  <ToggleButton value={"make"}>Jogar</ToggleButton>
                  <ToggleButton value={"moves"}>Histórico</ToggleButton>
                  <ToggleButton value={"board"}>Tabuleiro</ToggleButton>
                  <ToggleButton value={"settings"}>Ajustes</ToggleButton>
                </ToggleButtonGroup>
              </Row>
              <div style={{ marginTop: 10 }}>
                {this.shownElement()}
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

App.defaultProps = {
  showInput: false
}
