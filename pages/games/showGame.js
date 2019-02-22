import React, { Component} from 'react';
import Layout from '../../components/layout';
import rps from '../../ethereum/RPS';
import {Card,Segment,Grid} from 'semantic-ui-react';
import PlaySecond from '../../components/playSecond';
import Finalized from '../../components/finalize';
import CheckAndPay from '../../components/checkAndPay';
import Refund from '../../components/refund';

class ShowGame extends Component {
  state = {
    betAmount: '',
    balance: '',
    canFinalize: '',
    revealed: '',
    tie: '',
    finalizeCount:'',
    firstRevealTime: '',
    winner: '',
    creator: '',
    playerOneAddress: '',
    playerOneToldTruth: '',
    playerOneValidChoice: '',
    playerOneFinalized: '',
    playerOneChoice: '',
    playerOneSeed: '',
    playerTwoAddress: '',
    playerTwoToldTruth: '',
    playerTwoValidChoice: '',
    playerTwoFinalized: '',
    playerTwoChoice: '',
    playerTwoSeed: '',
    playerTwoExists: '',
  }

  static async getInitialProps(props) {
    const gameAddress = props.query.address;
    return{gameAddress};
  }

  async componentDidMount(){
    const rpsGame = rps(this.props.gameAddress);
    const summary = await rpsGame.methods.summary().call();
    
    this.setState({
      betAmount: summary[0],
      balance: summary[1],
      canFinalize: summary[2],
      revealed: summary[3],
      tie: summary[4],
      finalizeCount:summary[5],
      firstRevealTime: summary[6],
      winner: summary[7],
      creator: summary[8]
    });

    const playerOne = await rpsGame.methods.playerOneSummary().call();
    const playerTwo = await rpsGame.methods.playerTwoSummary().call();

    var twoExists = '';
    if(playerTwo[0]=="0x0000000000000000000000000000000000000000"){
      twoExists = false;
    } else {
      twoExists = true;
    }

    var [a,b,c,d,e] = playerOne[0].match(/.{1,9}/g);
    var s = ' ';
    var playerOneAddress = a+s+b+s+c+s+d+s+e;
    var [a,b,c,d,e] = playerTwo[0].match(/.{1,9}/g);
    var s = ' ';
    var playerTwoAddress = a+s+b+s+c+s+d+s+e;

    this.setState({
      playerOneAddress: playerOneAddress,
      playerOneToldTruth: playerOne[1],
      playerOneValidChoice: playerOne[2],
      playerOneFinalized: playerOne[3],
      playerOneChoice: playerOne[4],
      playerOneSeed: playerOne[5],
      playerTwoAddress: playerTwoAddress,
      playerTwoToldTruth: playerTwo[1],
      playerTwoValidChoice: playerTwo[2],
      playerTwoFinalized: playerTwo[3],
      playerTwoChoice: playerTwo[4],
      playerTwoSeed: playerTwo[5],
      playerTwoExists: twoExists
    })
  }
  renderGameInfo(){
    return(
      <Segment raised={true} color="blue">
      <Segment  raised={true} color="orange">
      <h5>Bet Amount: {this.state.betAmount}</h5>
      <h5>Initial Bettor: <br/><small>{this.state.playerOneAddress}</small></h5>
      <h5>Contract Balance: {this.state.balance}</h5>
      <h5>Can Finalize: {this.state.canFinalize.toString()}</h5>
      <h5>Revealed: {this.state.revealed.toString()}</h5>
      <h5>Tie: {this.state.tie.toString()}</h5>
      <h5>Does this Game have Second Player: {this.state.playerTwoExists.toString()}</h5>
      </Segment>
      <Grid columns="equal">
      <Grid.Column>
      <Segment  raised={true} color="purple">
      <h5>Player One Information</h5>
      <h5>Address: <br/><small>{this.state.playerOneAddress}</small></h5>
      <h5>Told the Truth: {this.state.playerOneToldTruth.toString()}</h5>
      <h5>Valid Choice: {this.state.playerOneValidChoice.toString()}</h5>
      <h5>Finalized: {this.state.playerOneFinalized.toString()}</h5>
      </Segment>
      </Grid.Column>
      <Grid.Column>
      <Segment  raised={true} color="purple">
      <h5>Player Two Information</h5>
      <h5>Address: <br/><small>{this.state.playerTwoAddress}</small></h5>
      <h5>Told the Truth: {this.state.playerTwoToldTruth.toString()}</h5>
      <h5>Valid Choice: {this.state.playerTwoValidChoice.toString()}</h5>
      <h5>Finalized: {this.state.playerTwoFinalized.toString()}</h5>
      </Segment>
      </Grid.Column>
      </Grid>
      <Segment  raised={true} color="orange">
      <PlaySecond address={this.props.gameAddress} amount={this.state.betAmount}/>
      <Finalized address={this.props.gameAddress}/>
      <CheckAndPay address={this.props.gameAddress}/>
      <Refund address={this.props.gameAddress}/>
      </Segment>
      </Segment>
    );
  }
  render(){
    return(
      <Layout>
        {(this.state.betAmount != '') && this.renderGameInfo()}
      </Layout>
    );
  }
}

export default ShowGame;
