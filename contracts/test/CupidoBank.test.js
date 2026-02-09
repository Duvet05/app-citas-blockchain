const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CupidoBank", function () {
  let profileNFT, bank;
  let owner, user1, user2, authorized;

  beforeEach(async function () {
    [owner, user1, user2, authorized] = await ethers.getSigners();

    const ProfileNFT = await ethers.getContractFactory("ProfileNFT");
    profileNFT = await ProfileNFT.deploy();
    await profileNFT.waitForDeployment();

    const CupidoBank = await ethers.getContractFactory("CupidoBank");
    bank = await CupidoBank.deploy(await profileNFT.getAddress());
    await bank.waitForDeployment();

    // Create profiles for users
    await profileNFT.connect(user1).createProfile("Alice", 25, "Bio", "karma", "");
    await profileNFT.connect(user2).createProfile("Bob", 30, "Bio", "web3", "");

    // Fund treasury
    await bank.deposit({ value: ethers.parseEther("10") });
  });

  describe("Treasury", function () {
    it("Should accept owner deposits", async function () {
      expect(await bank.getTreasuryBalance()).to.equal(ethers.parseEther("10"));
    });

    it("Should reject deposits from non-owner", async function () {
      await expect(
        bank.connect(user1).deposit({ value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(bank, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw", async function () {
      await bank.withdraw(ethers.parseEther("5"));
      expect(await bank.getTreasuryBalance()).to.equal(ethers.parseEther("5"));
    });

    it("Should accept raw ETH via receive()", async function () {
      await owner.sendTransaction({
        to: await bank.getAddress(),
        value: ethers.parseEther("1"),
      });
      expect(await bank.getTreasuryBalance()).to.equal(ethers.parseEther("11"));
    });

    it("Should reject zero deposit", async function () {
      await expect(bank.deposit({ value: 0 })).to.be.revertedWith("Must deposit > 0");
    });
  });

  describe("Loans", function () {
    it("Should grant a loan to a profiled user", async function () {
      await bank.connect(user1).requestLoan(ethers.parseEther("0.1"));
      const loans = await bank.getUserLoans(user1.address);
      expect(loans.length).to.equal(1);
      expect(loans[0].amount).to.equal(ethers.parseEther("0.1"));
      expect(loans[0].repaid).to.be.false;
    });

    it("Should reject loan if no profile", async function () {
      await expect(
        bank.connect(owner).requestLoan(ethers.parseEther("0.1"))
      ).to.be.revertedWith("Must have a profile");
    });

    it("Should reject loan exceeding max amount", async function () {
      await expect(
        bank.connect(user1).requestLoan(ethers.parseEther("0.2"))
      ).to.be.revertedWith("Exceeds max loan amount");
    });

    it("Should reject if too many active loans", async function () {
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));
      await expect(
        bank.connect(user1).requestLoan(ethers.parseEther("0.05"))
      ).to.be.revertedWith("Too many active loans");
    });

    it("Should allow loan repayment", async function () {
      await bank.connect(user1).requestLoan(ethers.parseEther("0.1"));
      await bank.connect(user1).repayLoan(0, { value: ethers.parseEther("0.1") });
      const loans = await bank.getUserLoans(user1.address);
      expect(loans[0].repaid).to.be.true;
    });

    it("Should refund excess repayment", async function () {
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));
      await expect(
        bank.connect(user1).repayLoan(0, { value: ethers.parseEther("0.1") })
      ).to.not.be.reverted;
    });

    it("Should track user debt", async function () {
      await bank.connect(user1).requestLoan(ethers.parseEther("0.1"));
      expect(await bank.getUserDebt(user1.address)).to.equal(ethers.parseEther("0.1"));

      await bank.connect(user1).repayLoan(0, { value: ethers.parseEther("0.1") });
      expect(await bank.getUserDebt(user1.address)).to.equal(0);
    });

    it("Should reject repaying already repaid loan", async function () {
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));
      await bank.connect(user1).repayLoan(0, { value: ethers.parseEther("0.05") });
      await expect(
        bank.connect(user1).repayLoan(0, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Loan already repaid");
    });

    it("Should allow new loan after repaying", async function () {
      // Fill up 3 loans
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));
      await bank.connect(user1).requestLoan(ethers.parseEther("0.05"));

      // Repay one
      await bank.connect(user1).repayLoan(0, { value: ethers.parseEther("0.05") });

      // Should allow new loan now
      await expect(
        bank.connect(user1).requestLoan(ethers.parseEther("0.05"))
      ).to.not.be.reverted;
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      await bank.authorizeContract(authorized.address);
    });

    it("Should allow authorized contract to add rewards", async function () {
      await bank.connect(authorized).addReward(user1.address, ethers.parseEther("0.05"));
      expect(await bank.pendingRewards(user1.address)).to.equal(ethers.parseEther("0.05"));
    });

    it("Should reject addReward from unauthorized caller", async function () {
      await expect(
        bank.connect(user1).addReward(user2.address, ethers.parseEther("0.05"))
      ).to.be.revertedWith("Not authorized");
    });

    it("Should allow user to claim rewards", async function () {
      await bank.connect(authorized).addReward(user1.address, ethers.parseEther("0.05"));
      await bank.connect(user1).claimRewards();
      expect(await bank.pendingRewards(user1.address)).to.equal(0);
    });

    it("Should reject claim with no rewards", async function () {
      await expect(bank.connect(user1).claimRewards()).to.be.revertedWith("No rewards to claim");
    });

    it("Should send reward directly", async function () {
      const balBefore = await ethers.provider.getBalance(user1.address);
      await bank.connect(authorized).sendReward(user1.address, ethers.parseEther("0.1"));
      const balAfter = await ethers.provider.getBalance(user1.address);
      expect(balAfter - balBefore).to.equal(ethers.parseEther("0.1"));
    });
  });

  describe("Authorization", function () {
    it("Should authorize and deauthorize contracts", async function () {
      await bank.authorizeContract(authorized.address);
      expect(await bank.authorizedContracts(authorized.address)).to.be.true;

      await bank.deauthorizeContract(authorized.address);
      expect(await bank.authorizedContracts(authorized.address)).to.be.false;
    });

    it("Should reject zero address authorization", async function () {
      await expect(
        bank.authorizeContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Admin settings", function () {
    it("Should allow owner to change max loan amount", async function () {
      await bank.setMaxLoanAmount(ethers.parseEther("0.5"));
      expect(await bank.maxLoanAmount()).to.equal(ethers.parseEther("0.5"));
    });

    it("Should allow owner to change max loans per user", async function () {
      await bank.setMaxLoansPerUser(5);
      expect(await bank.maxLoansPerUser()).to.equal(5);
    });
  });
});
