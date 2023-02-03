//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Greeter {
    string private greeting;
    int private n_updates;

    event GreetingSet(string greeting);
    event NUpdates(int n);

    constructor(string memory _greeting) {
        greeting = _greeting;

        emit GreetingSet(_greeting);
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
        n_updates = n_updates+1;

        emit GreetingSet(_greeting);
        emit NUpdates(n_updates);
    }
}