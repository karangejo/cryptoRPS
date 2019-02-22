import React, { Component } from 'react';
import Layout from '../components/layout';
import { Form, Button, Input, Message , Segment} from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import rps from '../ethereum/RPS';
import { Router } from '../routes';

class Refund extends Component {
  state = {
    errorMessage: '',
    loading: false,
    message: '',
    showSuccess: false

  }

  onSubmit = async (event) => {
    event.preventDefault();
    const rpsGame = rps(this.props.address);
    this.setState({loading:true,errorMessage: '',showSuccess: false});
    try{
      const accounts = await web3.eth.getAccounts();
      await rpsGame.methods
        .refund()
        .send({
          from: accounts[0]
        });
      const status = 'Succesfull Refund!'
      this.setState({message: status ,showSuccess: true})
      Router.pushRoute(`/games/${this.props.address}`);
    } catch (err) {
      this.setState({errorMessage: err.message});
    }
    this.setState({loading:false});
  };



  renderMessage(){
    return(
      <Message content={this.state.message}/>
    );
  }

  render(){
    return(
      <div>
     <Segment raised={true} color="red">
     <h3>Refund Game<br/><small>(can only be called if there is no player 2 or one player has not reavealed his answer after 24hrs)</small></h3>
     <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
      {this.state.showSuccess && this.renderMessage()}
     <Message error header="Oops!" content={this.state.errorMessage}/>
     <Button loading={this.state.loading} primary>Refund</Button>
     </Form>
     </Segment>
     </div>
    );
  }
}

export default Refund;
