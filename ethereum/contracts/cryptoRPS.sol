pragma solidity ^0.5.0;

contract RPSFactory {
     address [] public deployedPRPS;
     uint[] public amounts;

    function createRPSGame(uint amount,bytes32 choiceHash) public{
        address newRPS = address(new RPS(msg.sender,amount, choiceHash));
        deployedPRPS.push(newRPS);
        amounts.push(amount);    }

    function getDeployedAddress() public view returns  (address [] memory){
        return deployedPRPS;
    }

    function getDeployedAmounts() public view returns  (uint[] memory){
        return amounts;
    }

}

contract RPS {

    // a struct to hold data for each of the players
    struct Players {
        bytes32 hash;
        bytes32 verifyHash;
        address payable playerAddress;
        string choice;
        string seed;
        bool toldTruth;
        bool validChoice;
        bool finalized;
    }



    // initialize some variables we are going to need
    mapping (string => mapping(string => uint)) payoffMatrix;
    uint public betAmount;
    uint public balance;
    bool public canFinalize = false;
    bool public revealed;
    bool public tie = false;
    uint public finalizeCount = 0;
    uint public firstRevealTime;
    uint public maxWaitTime = 86400;
    address payable public winner;
    address payable public creator;
    Players[2] public players;

    function summary() public view returns(uint,uint,bool,bool,bool,uint,uint,address payable, address payable) {
        return(betAmount,balance,canFinalize,revealed,tie,finalizeCount,firstRevealTime,winner,creator);
    }

    function playerOneSummary() public view returns (address payable,bool,bool,bool,string memory,string memory) {
        return(players[0].playerAddress,players[0].toldTruth,players[0].validChoice,players[0].finalized,players[0].choice,players[0].seed);
    }

    function playerTwoSummary() public view returns (address payable,bool,bool,bool,string memory,string memory) {
        return(players[1].playerAddress,players[1].toldTruth,players[1].validChoice,players[1].finalized,players[1].choice,players[1].seed);
    }


    constructor( address payable betcreator, uint amount, bytes32 choiceHash) public {
        betAmount = amount;
        playFirst(amount,choiceHash,betcreator);

        //creator = ;

        payoffMatrix["rock"]["rock"] = 2;
        payoffMatrix["rock"]["paper"] = 1;
        payoffMatrix["rock"]["scissors"] = 0;
        payoffMatrix["paper"]["rock"] = 0;
        payoffMatrix["paper"]["paper"] = 2;
        payoffMatrix["paper"]["scissors"] = 1;
        payoffMatrix["scissors"]["rock"] = 1;
        payoffMatrix["scissors"]["paper"] = 0;
        payoffMatrix["scissors"]["scissors"] = 2;
    }

    function depositInitialBet() public payable{
        require(msg.sender == players[0].playerAddress && msg.value == betAmount);
        balance = address(this).balance;
    }

    // first player will call this function from the constructor
    function playFirst(uint amount, bytes32 choiceHash,address payable betcreator) private {
        players[0].hash =choiceHash;
        players[0].playerAddress=betcreator;
        balance = address(this).balance;
    }

    //second player calls this one
    function playSecond(bytes32 choiceHash) public payable {
        require(msg.value >= betAmount);
        require(msg.sender != players[0].playerAddress && msg.sender != creator);
        players[1].hash = choiceHash;
        players[1].playerAddress = msg.sender;
        balance = address(this).balance;
        canFinalize = true;
    }

    modifier playersOnly() {
        require(msg.sender == players[0].playerAddress || msg.sender == players[1].playerAddress);
        _;
    }


    function someoneHasFinalized() private returns (bool) {
        if(players[0].finalized == true || players[1].finalized == true){
            return true;
        } else {
            return false;
        }
    }

    function whoHasFinalized() private returns (uint) {
        if(players[0].finalized == true){
            return 0;
        } else {
            return 1;
        }
    }

    function noOneHasAccepted() private returns (bool) {
        if(players[1].playerAddress == address(0)){
            return true;
        } else {
            return false;
        }
    }

    // players can call this to get their money back if no one accepts their game
    // or if they reveal their choice and seed and the other player does not do so as well
    // in the alloted amount of time (24 hrs)
    function refund() public payable playersOnly {
        if(now > (maxWaitTime + firstRevealTime) && someoneHasFinalized()){
            uint win = whoHasFinalized();
            players[win].playerAddress.transfer(address(this).balance);
        }

        if(noOneHasAccepted()){
            players[0].playerAddress.transfer(address(this).balance);
        }
    }


    // this function is called to reveal your seed and choice
    // this is used to check whether or not you were telling the truth
    function finalize(string memory choice, string memory seed) public playersOnly{

        require(canFinalize == true);

        if(msg.sender == players[0].playerAddress && players[0].finalized == false){
            finalizeInternal(choice,seed,0);
            players[0].finalized = true;
        }
        else if(msg.sender == players[1].playerAddress && players[1].finalized == false){
            finalizeInternal(choice,seed,1);
            players[1].finalized = true;

        }
    }

    function finalizeInternal(string memory choice, string memory seed,uint index) private {

         players[index].choice = choice;
            players[index].seed = seed;
            validChoice(choice,index);
            checkTruth(index);
            finalizeCount++;
            if(finalizeCount ==1){
                firstRevealTime = now;
            }
            if(finalizeCount == 2){
                revealed = true;
            }
    }

    function checkTruth(uint index) private {
        players[index].verifyHash = keccak256(abi.encodePacked(players[index].seed , players[index].choice));
        if(players[index].hash == players[index].verifyHash){
            players[index].toldTruth = true;
        } else {
            players[index].toldTruth = false;
        }
    }

    function validChoice(string memory choice, uint index) private {
        // hack until we can use StringUtils.equal
        if (keccak256(abi.encodePacked(choice)) != keccak256(abi.encodePacked("rock")) && keccak256(abi.encodePacked(choice)) != keccak256(abi.encodePacked("paper")) && keccak256(abi.encodePacked(choice)) != keccak256(abi.encodePacked("scissors"))){
            players[index].validChoice = false;
        } else {
            players[index].validChoice = true;
        }

    }

    function playersToldTheTruth() private returns (bool) {
        if(players[0].toldTruth == true && players[1].toldTruth == true){
            return true;
        } else {
            return false;
        }
    }

    function playersHaveValidChoices() private returns (bool) {
        if(players[0].validChoice == true && players[1].validChoice == true){
            return true;
        } else {
            return false;
        }
    }

    function anyoneToldTheTruth() private returns (bool) {
        if(players[0].toldTruth == true || players[1].toldTruth == true){
            return true;
        } else {
            return false;
        }
    }

    function whoToldTheTruth() private returns (uint) {
        if(players[0].toldTruth == true){
            return 0;
        } else {
            return 1;
        }
    }

    function anyoneHaveValidChoice() private returns (bool) {
        if(players[0].validChoice == true ||players[1].validChoice == true){
            return true;
        } else {
            return false;
        }
    }

      function whoHasAValidChoice() private returns (uint) {
        if(players[0].validChoice == true){
            return 0;
        } else {
            return 1;
        }
    }

    // this function is usually called by the winner to get their payoff once everything has been revealed
    function checkAndPayout() public payable playersOnly{
        require(finalizeCount == 2);

        if(playersToldTheTruth() && playersHaveValidChoices()){
            uint win = payoffMatrix[players[0].choice][players[1].choice];
            if(win==2){
                tie = true;
            } else {
                winner = players[win].playerAddress;
            }
        }
        else if(playersToldTheTruth() && !playersHaveValidChoices()){
            if(anyoneHaveValidChoice()==true){
                winner= players[whoHasAValidChoice()].playerAddress;
            } else {
                winner = creator;
            }
        }
        else if(anyoneToldTheTruth()==true){
            winner = players[whoToldTheTruth()].playerAddress;
        }

        else if(anyoneToldTheTruth()==false){
            winner = creator;
        }

        if(tie == false){
                    winner.transfer(address(this).balance);
        } else {
            players[0].playerAddress.transfer(address(this).balance/2);
            players[1].playerAddress.transfer(address(this).balance);
        }
        balance = address(this).balance;
    }

}
