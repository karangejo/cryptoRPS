import React, { Component } from 'react';
import Layout from '../components/layout';
import {Card, Button,Segment} from 'semantic-ui-react';
import rpsFactory from '../ethereum/RPSfactory';
import { Link } from '../routes';
import NewGame from '../components/newGame';

class Index extends Component {
  static async getInitialProps() {
    const addresses = await rpsFactory.methods.getDeployedAddress().call();
    const amounts = await rpsFactory.methods.getDeployedAmounts().call();

    return { addresses,amounts };
  }


  renderGames() {
    const items = this.props.addresses.map( (address,index) => {
      return {
        header: `Bet Amount: ${this.props.amounts[index]}`,
        description: <Link route={`/games/${address}`}><a>View Game</a></Link>,
        meta: `Address: ${address}`,
        fluid: true,
        color: "green",
        raised: true
      };
    });
    return <Card.Group items= {items} />;
  }


  render() {
    return(
      <Layout>
      <Segment raised={true} color="orange">
      <h1>List of Games</h1>
        {this.renderGames()}
        </Segment>
        <NewGame/>
      </Layout>
    );
  }

}
export default  Index;
