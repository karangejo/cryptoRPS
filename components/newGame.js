import React, { Component } from 'react';
import Layout from '../components/layout';
import { Form, Button, Input, Message , Segment} from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import rpsFactory from '../ethereum/RPSfactory';
import { Router } from '../routes';

class NewGame extends Component {
  state = {
      errorMessage: '',
      amount: 0,
      hash: '',
      seed:'',
      choice:'',
      loading: false
    }

    onSubmit = async (event) => {
      event.preventDefault();
      const hash = web3.utils.soliditySha3(this.state.seed,this.state.choice);
      this.setState({loading:true,errorMessage: '',hash: hash});
      try{
        const accounts = await web3.eth.getAccounts();
        await rpsFactory.methods
          .createRPSGame(this.state.amount,this.state.hash)
          .send({
            from: accounts[0]
          });
        Router.pushRoute('/');
      } catch (err) {
        this.setState({errorMessage: err.message});
      }
      this.setState({loading:false});
    };

  render(){
    return(
      <Segment raised={true} color="green">
      <h3>Create A New Game!</h3>
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
      <Form.Field>
        <label>Enter the Amount of your Bet in Wei</label>
        <Input
          label="wei"
          labelPosition="right"
          value={this.state.amount}
          onChange={event =>
            this.setState({amount: event.target.value})}
        />
      </Form.Field>
      <Form.Field>
        <label>Enter a Random Seed (please remember this!)</label>
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
      <Message error header="Oops!" content={this.state.errorMessage}/>
      <Button loading={this.state.loading} primary>Play</Button>
    </Form>
    </Segment>
    );
  }
}

export default NewGame;
