import React, { Component } from "react";
import { Nav, Navbar, NavDropdown, Modal, NavItem, MenuItem } from "react-bootstrap";

export const appName = "Diagram OTB";

export class AppNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showAbout: false }
  }
  setAbout = val => this.setState({ showAbout: val })
  render = () => {
    return (
      <div style={{ marginBottom: 0 }}>
        <Navbar collapseOnSelect style={{ marginBottom: 0, borderRadius: 0 }}>
          <Navbar.Header>
            <Navbar.Brand href="#" style={{ display: 'flex' }}>
              <img src="icon.png" height="22" width="22" className="d-inline-block" style={{ marginRight: '4px' }} />
              Diagram OTB
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              <NavItem onClick={() => this.setAbout(true)}>
                Sobre
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Modal show={this.state.showAbout} onHide={() => this.setAbout(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Sobre o Diagram OTB</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>O Diagram OTB é uma ferramenta para jogar xadrez no tabuleiro contra o Stockfish ou jogar xadrez vendado.</p>
            <p>Para jogar, basta escolher os movimentos possíveis para suas peças e representar no seu tabuleiro o movimento feito pela engine.</p>
            <p>Você pode escolher a dificuldade de jogo alterando o rating do Stockfish em Ajustes.</p>
            <p>Esta é uma ferramenta gratuita.</p>
            <p>Diagram OTB é um fork de ChessInsights com adaptações e melhorias</p>
            <p><img src="https://icon-library.com/images/twiter-icon/twiter-icon-29.jpg" height="50" /><a href="https://twitter.com/m0nchal">@m0nchal</a></p>
          </Modal.Body>
        </Modal>
      </div >
    )
  }
}
