const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProfileNFT", function () {
  let profileNFT;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ProfileNFT = await ethers.getContractFactory("ProfileNFT");
    profileNFT = await ProfileNFT.deploy();
    await profileNFT.waitForDeployment();
  });

  describe("Profile Creation", function () {
    it("Should create a new profile", async function () {
      await profileNFT.connect(user1).createProfile(
        "Alice",
        25,
        "Love hiking and photography",
        "hiking, photography, travel",
        "ipfs://QmTest123"
      );

      expect(await profileNFT.hasProfile(user1.address)).to.be.true;
      const totalProfiles = await profileNFT.getTotalProfiles();
      expect(totalProfiles).to.equal(1);
    });

    it("Should fail if age is under 18", async function () {
      await expect(
        profileNFT.connect(user1).createProfile(
          "Bob",
          17,
          "Too young",
          "gaming",
          "ipfs://QmTest123"
        )
      ).to.be.revertedWith("Must be 18 or older");
    });

    it("Should fail if user already has a profile", async function () {
      await profileNFT.connect(user1).createProfile(
        "Alice",
        25,
        "First profile",
        "hiking",
        "ipfs://QmTest123"
      );

      await expect(
        profileNFT.connect(user1).createProfile(
          "Alice2",
          26,
          "Second profile",
          "hiking",
          "ipfs://QmTest456"
        )
      ).to.be.revertedWith("Profile already exists");
    });
  });

  describe("Profile Management", function () {
    beforeEach(async function () {
      await profileNFT.connect(user1).createProfile(
        "Alice",
        25,
        "Original bio",
        "hiking",
        "ipfs://QmTest123"
      );
    });

    it("Should update profile", async function () {
      await profileNFT.connect(user1).updateProfile(
        "Alice Updated",
        "New bio",
        "hiking, travel",
        ""
      );

      const profile = await profileNFT.getProfileByAddress(user1.address);
      expect(profile.name).to.equal("Alice Updated");
      expect(profile.bio).to.equal("New bio");
    });

    it("Should deactivate and reactivate profile", async function () {
      await profileNFT.connect(user1).deactivateProfile();
      let profile = await profileNFT.getProfileByAddress(user1.address);
      expect(profile.isActive).to.be.false;

      await profileNFT.connect(user1).reactivateProfile();
      profile = await profileNFT.getProfileByAddress(user1.address);
      expect(profile.isActive).to.be.true;
    });
  });

  describe("Soulbound Feature", function () {
    it("Should prevent profile transfers", async function () {
      await profileNFT.connect(user1).createProfile(
        "Alice",
        25,
        "Bio",
        "interests",
        "ipfs://QmTest123"
      );

      const tokenId = await profileNFT.addressToProfile(user1.address);

      await expect(
        profileNFT.connect(user1).transferFrom(user1.address, user2.address, tokenId)
      ).to.be.revertedWith("Profile NFTs are soulbound and cannot be transferred");
    });
  });
});
