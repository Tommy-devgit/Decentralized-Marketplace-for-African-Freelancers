import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const marketplace = await ethers.deployContract("Marketplace");
  await marketplace.waitForDeployment();

  console.log("Marketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});