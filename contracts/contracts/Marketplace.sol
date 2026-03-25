// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Escrow.sol";

contract Marketplace {
    enum JobStatus {
        Open,
        Accepted,
        Funded,
        Completed,
        Cancelled,
        Disputed
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        address token;
        uint256 amount;
        string title;
        string descriptionCid;
        JobStatus status;
        address escrow;
    }

    uint256 public nextJobId;
    address public owner;
    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 indexed jobId, address indexed client, address token, uint256 amount);
    event JobAccepted(uint256 indexed jobId, address indexed freelancer, address escrow);
    event JobFunded(uint256 indexed jobId);
    event JobCompleted(uint256 indexed jobId);
    event JobCancelled(uint256 indexed jobId);
    event JobDisputed(uint256 indexed jobId);
    event DisputeResolved(uint256 indexed jobId, bool releasedToFreelancer);

    error OnlyOwner();
    error OnlyClient();
    error OnlyParty();
    error InvalidStatus();
    error InvalidAmount();
    error MissingFreelancer();
    error JobNotFound();

    constructor() {
        owner = msg.sender;
        nextJobId = 1;
    }

    function _requireJob(uint256 jobId) internal view {
        if (jobs[jobId].id == 0) revert JobNotFound();
    }

    function createJob(
        string calldata title,
        string calldata descriptionCid,
        address token,
        uint256 amount
    ) external returns (uint256 jobId) {
        if (amount == 0) revert InvalidAmount();

        jobId = nextJobId++;
        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: address(0),
            token: token,
            amount: amount,
            title: title,
            descriptionCid: descriptionCid,
            status: JobStatus.Open,
            escrow: address(0)
        });

        emit JobCreated(jobId, msg.sender, token, amount);
    }

    function acceptJob(uint256 jobId) external {
        _requireJob(jobId);
        Job storage job = jobs[jobId];
        if (job.status != JobStatus.Open) revert InvalidStatus();

        job.freelancer = msg.sender;
        job.status = JobStatus.Accepted;

        Escrow escrow = new Escrow(job.client, job.freelancer, job.token, job.amount, address(this));
        job.escrow = address(escrow);

        emit JobAccepted(jobId, msg.sender, job.escrow);
    }

    function fundJob(uint256 jobId) external payable {
        _requireJob(jobId);
        Job storage job = jobs[jobId];
        if (job.client != msg.sender) revert OnlyClient();
        if (job.status != JobStatus.Accepted) revert InvalidStatus();
        if (job.freelancer == address(0)) revert MissingFreelancer();

        Escrow escrow = Escrow(job.escrow);
        escrow.depositFromClient{ value: msg.value }(msg.sender);

        job.status = JobStatus.Funded;
        emit JobFunded(jobId);
    }

    function approveCompletion(uint256 jobId) external {
        _requireJob(jobId);
        Job storage job = jobs[jobId];
        if (job.client != msg.sender) revert OnlyClient();
        if (job.status != JobStatus.Funded) revert InvalidStatus();

        Escrow(job.escrow).releasePayment();
        job.status = JobStatus.Completed;
        emit JobCompleted(jobId);
    }

    function requestRefund(uint256 jobId) external {
        _requireJob(jobId);
        Job storage job = jobs[jobId];
        if (job.client != msg.sender) revert OnlyClient();
        if (job.status != JobStatus.Funded) revert InvalidStatus();

        Escrow(job.escrow).refund();
        job.status = JobStatus.Cancelled;
        emit JobCancelled(jobId);
    }

    function raiseDispute(uint256 jobId) external {
        _requireJob(jobId);
        Job storage job = jobs[jobId];
        if (msg.sender != job.client && msg.sender != job.freelancer) revert OnlyParty();
        if (job.status != JobStatus.Funded) revert InvalidStatus();

        Escrow(job.escrow).raiseDispute();
        job.status = JobStatus.Disputed;
        emit JobDisputed(jobId);
    }

    function resolveDispute(uint256 jobId, bool releaseToFreelancer) external {
        if (msg.sender != owner) revert OnlyOwner();
        _requireJob(jobId);

        Job storage job = jobs[jobId];
        if (job.status != JobStatus.Disputed) revert InvalidStatus();

        Escrow(job.escrow).resolveDispute(releaseToFreelancer);
        job.status = releaseToFreelancer ? JobStatus.Completed : JobStatus.Cancelled;
        emit DisputeResolved(jobId, releaseToFreelancer);
    }
}

