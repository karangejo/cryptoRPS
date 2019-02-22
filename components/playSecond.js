import React, { Component } from 'react';
import Layout from '../components/layout';
import { Form, Button, Input, Message , Segment} from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import rps from '../ethereum/RPS';
import { Router } from '../routes';

class PlaySecond extends Component {
  state = {
    errorMessageOne: '',
    errorMessageTwo: '',
    seed: '',
    choice: '',
    hash: '',
    loadingOne: false,
    loadingTwo: false,
    showSuccess: false,
    message: ''
  }

  onSubmitTwo = async (event) => {
    event.preventDefault();
    const hash = web3.utils.soliditySha3(this.state.seed,this.state.choice);
    const rpsGame = rps(this.props.address);
    this.setState({loadingTwo:true,errorMessageTwo: '',hash: hash});
    try{
      const accounts = await web3.eth.getAccounts();
      await rpsGame.methods
        .playSecond(this.state.hash)
        .send({
          from: accounts[0],
          value: this.props.amount
        });
      Router.pushRoute(`/games/${this.props.address}`);
    } catch (err) {
      this.setState({errorMessageTwo: err.message});
    }
    this.setState({loadingTwo:false});
  };

  onSubmitOne = async (event) => {
   event.preventDefault();
   const rpsGame= rps(this.props.address);
   this.setState({loadingOne:true,errorMessageOne: '',showSuccess: false});
   try{
     const accounts = await web3.eth.getAccounts();
     await rpsGame.methods
       .depositInitialBet()
       .send({
         from: accounts[0],
         value: this.props.amount
       });
      const status = "Succesfull Deposit"
     this.setState({message: status ,showSuccess: true})
     setTimeout(function(){Router.pushRoute(`/games/${this.props.address}`);}, 2000);
   } catch (err) {
     this.setState({errorMessageOne: err.message});
   }
   this.setState({loadingOne:false});
 };

 renderMessageOne(){
   return(
     <Message content={this.state.message}/>
   );
 }

  render(){
    return(
      <div>
      <Segment raised={true} color="pink" text-align="center">
     <h3>Deposit Bet Amount <br/><small>(only for player one)</small></h3>
     <Form onSubmit={this.onSubmitOne} error={!!this.state.errorMessageOne}>
     {this.state.showSuccess && this.renderMessageOne()}
     <Message error header="Oops!" content={this.state.errorMessageOne}/>
     <Button loading={this.state.loadingOne} primary>Deposit</Button>
     </Form>
     </Segment>
     <Segment raised={true} color="green">
     <h3>Accept the Game and Play!</h3>
     <Form onSubmit={this.onSubmitTwo} error={!!this.state.errorMessageTwo}>
     <Form.Field>
       <label>Enter A Random Seed (please remember this)</label>
       <Input
         label="seed"
         labelPosition="right"
         value={this.state.seed}
         onChange={event =>
           this.setState({seed: event.target.value})}
       />
     </Form.Field>
     <Form.Field>
       <label>Enter your Play: rock/paper/scissors (please remember this too!)</label>
       <Input
         label="choice"
         labelPosition="right"
         value={this.state.choice}
         onChange={event =>
           this.setState({choice: event.target.value})}
       />
     </Form.Field>
     <Message error header="Oops!" content={this.state.errorMessageTwo}/>
     <Button loading={this.state.loadingTwo} primary>Play</Button>
     </Form>
     </Segment>
     </div>
    );
  }
}

export default PlaySecond;
