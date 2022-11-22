import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironmentExtended } from 'helpers/types/hardhat-type-extensions';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre as any;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy('Balloons', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: ["Hello"],
    log: true,
  });

  const balloons = await ethers.getContract('Balloons', deployer);
  await deploy('DEX', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [balloons.address],
    log: true,
    waitConfirmations: 5,
  });

  const dex = await ethers.getContract('DEX', deployer);

  // paste in your front-end address here to get 10 balloons on deploy:
  await balloons.transfer('0xDB1C60CF36097447D7f063118a74d1c6786386a6', '' + 10 * 10 ** 18);

  // // uncomment to init DEX on deploy:
  console.log('Approving DEX (' + dex.address + ') to take Balloons from main account...');
  // // If you are going to the testnet make sure your deployer account has enough ETH
  await balloons.approve(dex.address, ethers.utils.parseEther('100'));
  console.log('INIT exchange...');
  await dex.init(ethers.utils.parseEther('0.005'), {
    value: ethers.utils.parseEther('0.005'),
    gasLimit: 200000,
  });
};
export default func;
func.tags = ['Balloons', 'DEX'];
