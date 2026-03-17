import { expect } from "chai";
import { ethers } from "hardhat";

const ZERO = ethers.ZeroAddress;

describe("Marketplace", function () {
  it("runs native-ETH escrow flow", async function () {
    const [client, freelancer] = await ethers.getSigners();

    const marketplace = await ethers.deployContract("Marketplace");
    await marketplace.waitForDeployment();

    const amount = ethers.parseEther("1");
    const tx = await marketplace.connect(client).createJob(
      "Landing page",
      "bafy-test-cid",
      ZERO,
      amount
    );
    const receipt = await tx.wait();
    const jobId = receipt?.logs[0].args?.jobId ?? 1n;

    await marketplace.connect(freelancer).acceptJob(jobId);

    const job = await marketplace.jobs(jobId);
    expect(job.escrow).to.not.equal(ZERO);

    const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

    await marketplace.connect(client).fundJob(jobId, { value: amount });
    await marketplace.connect(client).approveCompletion(jobId);

    const updated = await marketplace.jobs(jobId);
    expect(updated.status).to.equal(3);

    const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
    expect(freelancerBalanceAfter).to.be.gt(freelancerBalanceBefore);
  });

  it("runs ERC20 escrow flow", async function () {
    const [client, freelancer] = await ethers.getSigners();

    const marketplace = await ethers.deployContract("Marketplace");
    await marketplace.waitForDeployment();

    const token = await ethers.deployContract("MockERC20");
    await token.waitForDeployment();

    const amount = ethers.parseEther("250");
    await token.mint(client.address, amount);

    const tx = await marketplace.connect(client).createJob(
      "Logo design",
      "bafy-logo-cid",
      await token.getAddress(),
      amount
    );
    const receipt = await tx.wait();
    const jobId = receipt?.logs[0].args?.jobId ?? 1n;

    await marketplace.connect(freelancer).acceptJob(jobId);
    const job = await marketplace.jobs(jobId);

    await token.connect(client).approve(job.escrow, amount);

    await marketplace.connect(client).fundJob(jobId);
    await marketplace.connect(client).approveCompletion(jobId);

    const freelancerBalance = await token.balanceOf(freelancer.address);
    expect(freelancerBalance).to.equal(amount);
  });
});