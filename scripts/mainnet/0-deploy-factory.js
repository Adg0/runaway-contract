const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const { getTimeout } = require("../../utils/utils");

async function main() {
  const [deployer] = await ethers.getSigners();

  let summary = {};

  console.log("Deployer wallet:", deployer.address);

  const chainId = await hre.network.provider.send("eth_chainId");
  const timeout = getTimeout(chainId);

  // Access beacon
  const beaconAccess = "0x858321da21f789a7A442A96D17012cc7508FD881";

  // AzuroBet beacon
  const beaconAzuroBet = "0xF77BD07C34D83152Ef3d531f59bCCDc99868C9fa";

  // LP beacon
  const beaconLP = "0x3F661bb14864051088545ea5A6d52E1a687F6BaD";

  // silence linked library proxy deploy warning:
  // Warning: Potentially unsafe deployment of PrematchCore
  //  You are using the `unsafeAllow.external-library-linking` flag to include external libraries.
  //  Make sure you have manually checked that the linked libraries are upgrade safe.
  upgrades.silenceWarnings();

  // Affiliate helper library
  const affiliateHelper = "0xe9Ddf9935465EEefBFA09F1c8158d5ceA7685676";

  // Pre-match core beacon
  const beaconPrematchCore = "0xA5715BEC58c135eA2c7F735826Ad8DE61ca94E81";

  // Pool Factory
  const Factory = await ethers.getContractFactory("Factory", { signer: deployer });
  const factory = await upgrades.deployProxy(Factory, [beaconAccess, beaconLP]);
  await timeout();

  // setting up
  console.log("updatePrematchCoreType for pre-match...");
  await factory.updateCoreType("pre-match", beaconPrematchCore, beaconAzuroBet);
  await timeout();

  const factoryImplAddress = await upgrades.erc1967.getImplementationAddress(factory.address);

  summary["factory"] = factory.address;
  console.log("\nfactory", factory.address, "\nfactoryImpl", factoryImplAddress);

  console.log("\nCONTRACTS FOR WEB APP:", JSON.stringify(summary));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
