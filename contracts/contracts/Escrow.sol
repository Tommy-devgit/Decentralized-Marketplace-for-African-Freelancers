// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract Escrow {
    enum State {
        Created,
        Funded,
        Completed,
        Refunded,
        Disputed
    }

    address public immutable client;
    address public immutable freelancer;
    address public immutable token;
    address public immutable arbiter;
    uint256 public immutable amount;
    State public state;

    event Funded(address indexed client, uint256 amount);
    event Released(address indexed freelancer, uint256 amount);
    event Refunded(address indexed client, uint256 amount);
    event Disputed(address indexed raisedBy);
    event Resolved(bool releasedToFreelancer);

    error OnlyClient();
    error OnlyParty();
    error OnlyArbiter();
    error InvalidState();
    error InvalidAmount();
    error InvalidPayer();

    constructor(
        address _client,
        address _freelancer,
        address _token,
        uint256 _amount,
        address _arbiter
    ) {
        client = _client;
        freelancer = _freelancer;
        token = _token;
        amount = _amount;
        arbiter = _arbiter;
        state = State.Created;
    }

    function deposit() external payable {
        if (msg.sender != client) revert OnlyClient();
        _depositFrom(client);
        emit Funded(msg.sender, amount);
    }

    function depositFromClient(address payer) external payable {
        if (msg.sender != arbiter) revert OnlyArbiter();
        if (payer != client) revert InvalidPayer();
        _depositFrom(payer);
        emit Funded(payer, amount);
    }

    function releasePayment() external {
        if (msg.sender != client) revert OnlyClient();
        if (state != State.Funded) revert InvalidState();

        state = State.Completed;
        _payout(freelancer, amount);
        emit Released(freelancer, amount);
    }

    function refund() external {
        if (msg.sender != client) revert OnlyClient();
        if (state != State.Funded) revert InvalidState();

        state = State.Refunded;
        _payout(client, amount);
        emit Refunded(client, amount);
    }

    function raiseDispute() external {
        if (msg.sender != client && msg.sender != freelancer) revert OnlyParty();
        if (state != State.Funded) revert InvalidState();

        state = State.Disputed;
        emit Disputed(msg.sender);
    }

    function resolveDispute(bool releaseToFreelancer) external {
        if (msg.sender != arbiter) revert OnlyArbiter();
        if (state != State.Disputed) revert InvalidState();

        state = releaseToFreelancer ? State.Completed : State.Refunded;
        address recipient = releaseToFreelancer ? freelancer : client;
        _payout(recipient, amount);
        emit Resolved(releaseToFreelancer);
    }

    function _depositFrom(address payer) internal {
        if (state != State.Created) revert InvalidState();

        if (token == address(0)) {
            if (msg.value != amount) revert InvalidAmount();
        } else {
            if (msg.value != 0) revert InvalidAmount();
            bool ok = IERC20(token).transferFrom(payer, address(this), amount);
            require(ok, "ERC20_TRANSFER_FROM_FAILED");
        }

        state = State.Funded;
    }

    function _payout(address to, uint256 value) internal {
        if (token == address(0)) {
            (bool ok, ) = to.call{ value: value }("");
            require(ok, "NATIVE_TRANSFER_FAILED");
        } else {
            bool ok = IERC20(token).transfer(to, value);
            require(ok, "ERC20_TRANSFER_FAILED");
        }
    }
}
