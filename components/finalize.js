import React, { Component } from 'react';
import Layout from '../components/layout';
import { Form, Button, Input, Message , Segment} from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import rps from '../ethereum/RPS';
import { Router } from '../routes';

class Finalize extends Component {
  state = {
    errorMessage: '',
    seed: '',
    choice: '',
    loading: false,

  }

  onSubmit = async (event) => {
    event.preventDefault();
    const rpsGame = rps(this.props.address);
    this.setState({loading:true,errorMessage: ''});
    try{
      const accounts = await web3.eth.getAccounts();
      await rpsGame.methods
        .finalize(this.state.choice,this.state.seed)
        .send({
          from: accounts[0]
        });
      Router.pushRoute(`/games/${this.props.address}`);
    } catch (err) {
      this.setState({errorMessage: err.message});
    }
    this.setState({loading:false});
  };





  render(){
    return(
      <div>
     <Segment raised={true} color="red">
     <h3>Finalized the Game<br/><small>(can only be called after there are 2 players)</small></h3>
     <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
     <Form.Field>
       <label>Enter Your Random Seed</label>
       <Input
         label="seed"
         labelPosition="right"
         value={this.state.seed}
         onChange={event =>
           this.setState({seed: event.target.value})}
       />
     </Form.Field>
     <Form.Field>
       <label>Enter your Play: rock/paper/scissors</label>
       <Input
         label="choice"
         labelPosition="right"
         value={this.state.choice}
         onChange={event =>
           this.setState({choice: event.target.value})}
       />
     </Form.Field>
     <Message error header="Oops!" content={this.state.errorMessag}/>
     <Button loading={this.state.loading} primary>Finalize</Button>
     </Form>
     </Segment>
     </div>
    );
  }
}

export default Finalize;
