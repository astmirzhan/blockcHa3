const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Week4Token", function () {
  async function deployTokenFixture() {
    const [owner, user] = await ethers.getSigners();
    const initialSupply = ethers.parseUnits("1000000", 18);

    const Token = await ethers.getContractFactory("Week4Token");
    const token = await Token.deploy(initialSupply);

    return { token, owner, user, initialSupply };
  }

  it("mints full supply to deployer", async function () {
    const { token, owner, initialSupply } = await loadFixture(deployTokenFixture);
    const ownerBalance = await token.balanceOf(owner.address);

    expect(ownerBalance).to.equal(initialSupply);
    expect(await token.totalSupply()).to.equal(initialSupply);
  });

  it("transfers tokens and updates balances", async function () {
    const { token, owner, user } = await loadFixture(deployTokenFixture);
    const amount = ethers.parseUnits("2500", 18);

    await expect(token.transfer(user.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, user.address, amount);

    expect(await token.balanceOf(user.address)).to.equal(amount);
  });

  it("reverts when balance is insufficient", async function () {
    const { token, user } = await loadFixture(deployTokenFixture);
    const amount = ethers.parseUnits("1", 18);

    await expect(token.connect(user).transfer(user.address, amount)).to.be.revertedWith(
      "ERC20: transfer amount exceeds balance",
    );
  });
});
