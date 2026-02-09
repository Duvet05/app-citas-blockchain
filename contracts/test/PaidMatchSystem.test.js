const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaidMatchSystem", function () {
  let profileNFT, bank, paidMatch;
  let owner, user1, user2, user3;
  const LIKE_FEE = ethers.parseEther("0.01");
  const MATCH_REWARD = ethers.parseEther("0.005");

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const ProfileNFT = await ethers.getContractFactory("ProfileNFT");
    profileNFT = await ProfileNFT.deploy();
    await profileNFT.waitForDeployment();

    const CupidoBank = await ethers.getContractFactory("CupidoBank");
    bank = await CupidoBank.deploy(await profileNFT.getAddress());
    await bank.waitForDeployment();

    const PaidMatchSystem = await ethers.getContractFactory("PaidMatchSystem");
    paidMatch = await PaidMatchSystem.deploy(
      await profileNFT.getAddress(),
      await bank.getAddress()
    );
    await paidMatch.waitForDeployment();

    // Authorize PaidMatchSystem in bank
    await bank.authorizeContract(await paidMatch.getAddress());

    // Fund treasury
    await bank.deposit({ value: ethers.parseEther("10") });

    // Create profiles
    await profileNFT.connect(user1).createProfile("Alice", 25, "Bio", "karma", "");
    await profileNFT.connect(user2).createProfile("Bob", 30, "Bio", "web3", "");
    await profileNFT.connect(user3).createProfile("Charlie", 28, "Bio", "syscoin", "");
  });

  describe("Paid Likes", function () {
    it("Should accept a paid like", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      expect(await paidMatch.likes(user1.address, user2.address)).to.be.true;
    });

    it("Should reject like with insufficient payment", async function () {
      await expect(
        paidMatch.connect(user1).likeProfile(user2.address, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject like without profile", async function () {
      await expect(
        paidMatch.connect(owner).likeProfile(user1.address, { value: LIKE_FEE })
      ).to.be.revertedWith("You must have a profile");
    });

    it("Should reject self-like", async function () {
      await expect(
        paidMatch.connect(user1).likeProfile(user1.address, { value: LIKE_FEE })
      ).to.be.revertedWith("Cannot like yourself");
    });

    it("Should reject duplicate like", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      await expect(
        paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE })
      ).to.be.revertedWith("Already liked this profile");
    });

    it("Should split fee 50/50 between bank and liked user", async function () {
      const bankBalBefore = await bank.getTreasuryBalance();
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      const bankBalAfter = await bank.getTreasuryBalance();

      const bankShare = LIKE_FEE / 2n;
      const userShare = LIKE_FEE - bankShare;

      expect(bankBalAfter - bankBalBefore).to.equal(bankShare);
      expect(await bank.pendingRewards(user2.address)).to.equal(userShare);
    });

    it("Should track totalSpent", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      expect(await paidMatch.totalSpent(user1.address)).to.equal(LIKE_FEE);
    });

    it("Should track totalEarned for liked user", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      const userShare = LIKE_FEE - LIKE_FEE / 2n;
      expect(await paidMatch.totalEarned(user2.address)).to.equal(userShare);
    });

    it("Should accept overpayment gracefully", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: ethers.parseEther("0.05") });
      expect(await paidMatch.likes(user1.address, user2.address)).to.be.true;
      // totalSpent tracks actual payment
      expect(await paidMatch.totalSpent(user1.address)).to.equal(ethers.parseEther("0.05"));
    });
  });

  describe("Mutual Matches with Rewards", function () {
    it("Should create match on mutual like", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      await paidMatch.connect(user2).likeProfile(user1.address, { value: LIKE_FEE });

      expect(await paidMatch.isMatch(user1.address, user2.address)).to.be.true;
      const matches = await paidMatch.getActiveMatches(user1.address);
      expect(matches.length).to.equal(1);
    });

    it("Should NOT create match on one-sided like", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      expect(await paidMatch.isMatch(user1.address, user2.address)).to.be.false;
    });

    it("Should auto-send match rewards to both users", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });

      const bal1Before = await ethers.provider.getBalance(user1.address);
      await paidMatch.connect(user2).likeProfile(user1.address, { value: LIKE_FEE });

      const bal1After = await ethers.provider.getBalance(user1.address);
      // user1 gets MATCH_REWARD (didn't send a tx, so no gas cost)
      expect(bal1After - bal1Before).to.equal(MATCH_REWARD);
    });

    it("Should emit MatchCreated and MatchRewardPaid", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });

      await expect(
        paidMatch.connect(user2).likeProfile(user1.address, { value: LIKE_FEE })
      )
        .to.emit(paidMatch, "MatchCreated")
        .and.to.emit(paidMatch, "MatchRewardPaid");
    });

    it("Should handle match even if bank is underfunded", async function () {
      // Drain bank
      await bank.withdraw(ethers.parseEther("10"));

      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      await paidMatch.connect(user2).likeProfile(user1.address, { value: LIKE_FEE });

      // Match still created despite no reward funds
      expect(await paidMatch.isMatch(user1.address, user2.address)).to.be.true;
    });

    it("Should handle multiple matches", async function () {
      // user1 <-> user2
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      await paidMatch.connect(user2).likeProfile(user1.address, { value: LIKE_FEE });

      // user1 <-> user3
      await paidMatch.connect(user1).likeProfile(user3.address, { value: LIKE_FEE });
      await paidMatch.connect(user3).likeProfile(user1.address, { value: LIKE_FEE });

      const matches1 = await paidMatch.getActiveMatches(user1.address);
      expect(matches1.length).to.equal(2);

      const matches2 = await paidMatch.getActiveMatches(user2.address);
      expect(matches2.length).to.equal(1);
    });
  });

  describe("Unmatch", function () {
    beforeEach(async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      await paidMatch.connect(user2).likeProfile(user1.address, { value: LIKE_FEE });
    });

    it("Should allow unmatch", async function () {
      await paidMatch.connect(user1).unmatch(user2.address);
      expect(await paidMatch.isMatch(user1.address, user2.address)).to.be.false;
    });

    it("Should reject unmatch with no match", async function () {
      await expect(
        paidMatch.connect(user1).unmatch(user3.address)
      ).to.be.revertedWith("No match exists");
    });
  });

  describe("View Functions", function () {
    it("Should return user economics", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      const [earned, spent, pending] = await paidMatch.getUserEconomics(user1.address);
      expect(spent).to.equal(LIKE_FEE);
      expect(earned).to.equal(0);
    });

    it("Should return total matches", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });
      await paidMatch.connect(user2).likeProfile(user1.address, { value: LIKE_FEE });
      expect(await paidMatch.getTotalMatches()).to.equal(1);
    });

    it("Should return sent and received likes", async function () {
      await paidMatch.connect(user1).likeProfile(user2.address, { value: LIKE_FEE });

      const sent = await paidMatch.connect(user1).getSentLikes();
      expect(sent.length).to.equal(1);
      expect(sent[0]).to.equal(user2.address);

      const received = await paidMatch.connect(user2).getReceivedLikes();
      expect(received.length).to.equal(1);
      expect(received[0]).to.equal(user1.address);
    });
  });

  describe("Admin", function () {
    it("Should allow owner to change like fee", async function () {
      await paidMatch.setLikeFee(ethers.parseEther("0.02"));
      expect(await paidMatch.likeFee()).to.equal(ethers.parseEther("0.02"));
    });

    it("Should allow owner to change match reward", async function () {
      await paidMatch.setMatchReward(ethers.parseEther("0.01"));
      expect(await paidMatch.matchReward()).to.equal(ethers.parseEther("0.01"));
    });

    it("Should reject non-owner fee change", async function () {
      await expect(
        paidMatch.connect(user1).setLikeFee(ethers.parseEther("0.02"))
      ).to.be.revertedWithCustomError(paidMatch, "OwnableUnauthorizedAccount");
    });
  });
});
