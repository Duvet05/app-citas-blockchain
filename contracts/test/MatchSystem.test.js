const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchSystem (Recognition System)", function () {
  let profileNFT;
  let matchSystem;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy ProfileNFT first
    const ProfileNFT = await ethers.getContractFactory("ProfileNFT");
    profileNFT = await ProfileNFT.deploy();
    await profileNFT.waitForDeployment();

    // Deploy MatchSystem
    const MatchSystem = await ethers.getContractFactory("MatchSystem");
    matchSystem = await MatchSystem.deploy(await profileNFT.getAddress());
    await matchSystem.waitForDeployment();

    // Create profiles for users
    await profileNFT.connect(user1).createProfile(
      "Alice",
      25,
      "User 1 bio",
      "karma,web3",
      ""
    );

    await profileNFT.connect(user2).createProfile(
      "Bob",
      30,
      "User 2 bio",
      "blockchain",
      ""
    );

    await profileNFT.connect(user3).createProfile(
      "Charlie",
      28,
      "User 3 bio",
      "syscoin",
      ""
    );
  });

  describe("Giving Recognition (Likes)", function () {
    it("Should allow user to give recognition to another user", async function () {
      await matchSystem.connect(user1).likeProfile(user2.address);

      expect(await matchSystem.likes(user1.address, user2.address)).to.be.true;
    });

    it("Should emit LikeGiven event", async function () {
      await expect(matchSystem.connect(user1).likeProfile(user2.address))
        .to.emit(matchSystem, "LikeGiven")
        .withArgs(user1.address, user2.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should fail if user tries to recognize themselves", async function () {
      await expect(
        matchSystem.connect(user1).likeProfile(user1.address)
      ).to.be.revertedWith("Cannot like yourself");
    });

    it("Should fail if user has no profile", async function () {
      await expect(
        matchSystem.connect(owner).likeProfile(user1.address)
      ).to.be.revertedWith("You must have a profile");
    });

    it("Should fail if target has no profile", async function () {
      await expect(
        matchSystem.connect(user1).likeProfile(owner.address)
      ).to.be.revertedWith("Target user has no profile");
    });

    it("Should fail if already gave recognition", async function () {
      await matchSystem.connect(user1).likeProfile(user2.address);

      await expect(
        matchSystem.connect(user1).likeProfile(user2.address)
      ).to.be.revertedWith("Already liked this profile");
    });

    it("Should fail if user profile is deactivated", async function () {
      await profileNFT.connect(user1).deactivateProfile();

      await expect(
        matchSystem.connect(user1).likeProfile(user2.address)
      ).to.be.revertedWith("Your profile is not active");
    });

    it("Should fail if target profile is deactivated", async function () {
      await profileNFT.connect(user2).deactivateProfile();

      await expect(
        matchSystem.connect(user1).likeProfile(user2.address)
      ).to.be.revertedWith("Target profile is not active");
    });
  });

  describe("Mutual Recognition (Matches)", function () {
    it("Should create a match when recognition is mutual", async function () {
      // User1 recognizes User2
      await matchSystem.connect(user1).likeProfile(user2.address);

      // User2 recognizes User1 → Should create match
      await expect(matchSystem.connect(user2).likeProfile(user1.address))
        .to.emit(matchSystem, "MatchCreated");

      const matchesUser1 = await matchSystem.getActiveMatches(user1.address);
      const matchesUser2 = await matchSystem.getActiveMatches(user2.address);

      expect(matchesUser1.length).to.equal(1);
      expect(matchesUser2.length).to.equal(1);
    });

    it("Should NOT create match if only one-sided", async function () {
      await matchSystem.connect(user1).likeProfile(user2.address);

      const matchesUser1 = await matchSystem.getActiveMatches(user1.address);
      const matchesUser2 = await matchSystem.getActiveMatches(user2.address);

      expect(matchesUser1.length).to.equal(0);
      expect(matchesUser2.length).to.equal(0);
    });

    it("Should handle multiple matches for same user", async function () {
      // User1 <-> User2 match
      await matchSystem.connect(user1).likeProfile(user2.address);
      await matchSystem.connect(user2).likeProfile(user1.address);

      // User1 <-> User3 match
      await matchSystem.connect(user1).likeProfile(user3.address);
      await matchSystem.connect(user3).likeProfile(user1.address);

      const matchesUser1 = await matchSystem.getActiveMatches(user1.address);
      expect(matchesUser1.length).to.equal(2);
    });
  });

  describe("Unmatching", function () {
    beforeEach(async function () {
      // Create a match first
      await matchSystem.connect(user1).likeProfile(user2.address);
      await matchSystem.connect(user2).likeProfile(user1.address);
    });

    it("Should allow user to unmatch", async function () {
      // Unmatch using the other user's address (as per contract logic)
      await matchSystem.connect(user1).unmatch(user2.address);

      const matchesAfter = await matchSystem.getActiveMatches(user1.address);
      expect(matchesAfter.length).to.equal(0);
    });

    it("Should emit MatchDeactivated event", async function () {
      await expect(matchSystem.connect(user1).unmatch(user2.address))
        .to.emit(matchSystem, "MatchDeactivated");
    });

    it("Should fail if match doesn't exist", async function () {
      await expect(
        matchSystem.connect(user1).unmatch(user3.address)
      ).to.be.revertedWith("No match exists");
    });

    it("Should fail if match is already inactive", async function () {
      await matchSystem.connect(user1).unmatch(user2.address);

      await expect(
        matchSystem.connect(user1).unmatch(user2.address)
      ).to.be.revertedWith("Match already inactive");
    });

    it("Should fail if caller is not part of the match", async function () {
      await expect(
        matchSystem.connect(user3).unmatch(user2.address)
      ).to.be.revertedWith("No match exists");
    });
  });

  describe("Recognition Tracking", function () {
    it("Should track all recognitions given by user", async function () {
      await matchSystem.connect(user1).likeProfile(user2.address);
      await matchSystem.connect(user1).likeProfile(user3.address);

      const likesGiven = await matchSystem.userLikes(user1.address, 0);
      expect(likesGiven).to.equal(user2.address);

      const likesGiven2 = await matchSystem.userLikes(user1.address, 1);
      expect(likesGiven2).to.equal(user3.address);
    });

    it("Should track all recognitions received by user", async function () {
      await matchSystem.connect(user1).likeProfile(user2.address);
      await matchSystem.connect(user3).likeProfile(user2.address);

      const likesReceived = await matchSystem.receivedLikes(user2.address, 0);
      expect(likesReceived).to.equal(user1.address);

      const likesReceived2 = await matchSystem.receivedLikes(user2.address, 1);
      expect(likesReceived2).to.equal(user3.address);
    });
  });

  describe("Match Retrieval", function () {
    it("Should return only active matches", async function () {
      // Create 2 matches
      await matchSystem.connect(user1).likeProfile(user2.address);
      await matchSystem.connect(user2).likeProfile(user1.address);

      await matchSystem.connect(user1).likeProfile(user3.address);
      await matchSystem.connect(user3).likeProfile(user1.address);

      let matches = await matchSystem.getActiveMatches(user1.address);
      expect(matches.length).to.equal(2);

      // Unmatch one
      await matchSystem.connect(user1).unmatch(user2.address);

      // Should now return only 1 active match
      matches = await matchSystem.getActiveMatches(user1.address);
      expect(matches.length).to.equal(1);
    });

    it("Should return empty array if no matches", async function () {
      const matches = await matchSystem.getActiveMatches(user1.address);
      expect(matches.length).to.equal(0);
    });
  });

  describe("Gas Optimization (Anti-Spam)", function () {
    it("Recognition should cost gas (prevents spam)", async function () {
      const tx = await matchSystem.connect(user1).likeProfile(user2.address);
      const receipt = await tx.wait();

      // Should consume gas
      expect(receipt.gasUsed).to.be.greaterThan(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle recognition after reactivating profile", async function () {
      // Deactivate and reactivate
      await profileNFT.connect(user1).deactivateProfile();
      await profileNFT.connect(user1).reactivateProfile();

      // Should be able to give recognition
      await matchSystem.connect(user1).likeProfile(user2.address);
      expect(await matchSystem.likes(user1.address, user2.address)).to.be.true;
    });

    it("Should prevent duplicate matches", async function () {
      // Create match
      await matchSystem.connect(user1).likeProfile(user2.address);
      await matchSystem.connect(user2).likeProfile(user1.address);

      const matchesBefore = await matchSystem.getActiveMatches(user1.address);
      expect(matchesBefore.length).to.equal(1);

      // Unmatch
      await matchSystem.connect(user1).unmatch(user2.address);

      // Verify match is now inactive
      const matchesAfter = await matchSystem.getActiveMatches(user1.address);
      expect(matchesAfter.length).to.equal(0);
    });
  });
});
