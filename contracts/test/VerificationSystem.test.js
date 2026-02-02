const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerificationSystem (Education & Participation Tracking)", function () {
  let profileNFT;
  let verificationSystem;
  let owner;
  let verifier;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, verifier, user1, user2] = await ethers.getSigners();

    // Deploy ProfileNFT
    const ProfileNFT = await ethers.getContractFactory("ProfileNFT");
    profileNFT = await ProfileNFT.deploy();
    await profileNFT.waitForDeployment();

    // Deploy VerificationSystem
    const VerificationSystem = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystem.deploy(await profileNFT.getAddress());
    await verificationSystem.waitForDeployment();

    // Create profiles
    await profileNFT.connect(user1).createProfile(
      "Alice",
      25,
      "Bio",
      "interests",
      ""
    );

    await profileNFT.connect(user2).createProfile(
      "Bob",
      30,
      "Bio",
      "interests",
      ""
    );
  });

  describe("Deployment", function () {
    it("Should set owner as initial verifier", async function () {
      expect(await verificationSystem.isVerifier(owner.address)).to.be.true;
    });

    it("Should set correct ProfileNFT address", async function () {
      expect(await verificationSystem.profileNFT()).to.equal(await profileNFT.getAddress());
    });
  });

  describe("Verifier Management", function () {
    it("Should allow owner to add verifier", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);
      expect(await verificationSystem.isVerifier(verifier.address)).to.be.true;
    });

    it("Should emit VerifierAdded event", async function () {
      await expect(verificationSystem.connect(owner).addVerifier(verifier.address))
        .to.emit(verificationSystem, "VerifierAdded")
        .withArgs(verifier.address);
    });

    it("Should allow owner to remove verifier", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);
      await verificationSystem.connect(owner).removeVerifier(verifier.address);

      expect(await verificationSystem.isVerifier(verifier.address)).to.be.false;
    });

    it("Should emit VerifierRemoved event", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);

      await expect(verificationSystem.connect(owner).removeVerifier(verifier.address))
        .to.emit(verificationSystem, "VerifierRemoved")
        .withArgs(verifier.address);
    });

    it("Should fail if non-owner tries to add verifier", async function () {
      await expect(
        verificationSystem.connect(user1).addVerifier(verifier.address)
      ).to.be.reverted; // OwnableUnauthorizedAccount error
    });

    it("Should fail to add zero address as verifier", async function () {
      await expect(
        verificationSystem.connect(owner).addVerifier(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Granting Verifications (Education Completion)", function () {
    beforeEach(async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);
    });

    it("Should allow verifier to grant verification", async function () {
      // Grant AGE verification (represents completing "Age verification module")
      await verificationSystem.connect(verifier).grantVerification(
        user1.address,
        1, // AGE
        0  // No expiration
      );

      expect(await verificationSystem.isVerified(user1.address, 1)).to.be.true;
    });

    it("Should emit VerificationGranted event", async function () {
      await expect(
        verificationSystem.connect(verifier).grantVerification(
          user1.address,
          1, // AGE
          0
        )
      )
        .to.emit(verificationSystem, "VerificationGranted")
        .withArgs(user1.address, 1, verifier.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should fail if non-verifier tries to grant", async function () {
      await expect(
        verificationSystem.connect(user2).grantVerification(
          user1.address,
          1,
          0
        )
      ).to.be.revertedWith("Not authorized verifier");
    });

    it("Should fail if user has no profile", async function () {
      await expect(
        verificationSystem.connect(verifier).grantVerification(
          owner.address,
          1,
          0
        )
      ).to.be.revertedWith("User has no profile");
    });

    it("Should allow granting multiple verification types", async function () {
      // Grant multiple "module completions"
      await verificationSystem.connect(verifier).grantVerification(user1.address, 0, 0); // IDENTITY
      await verificationSystem.connect(verifier).grantVerification(user1.address, 1, 0); // AGE
      await verificationSystem.connect(verifier).grantVerification(user1.address, 4, 0); // EDUCATION

      expect(await verificationSystem.isVerified(user1.address, 0)).to.be.true;
      expect(await verificationSystem.isVerified(user1.address, 1)).to.be.true;
      expect(await verificationSystem.isVerified(user1.address, 4)).to.be.true;
    });

    it("Should handle verification with expiration", async function () {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 86400; // 1 day

      await verificationSystem.connect(verifier).grantVerification(
        user1.address,
        1,
        futureTimestamp
      );

      expect(await verificationSystem.isVerified(user1.address, 1)).to.be.true;
    });
  });

  describe("Revoking Verifications", function () {
    beforeEach(async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);
      await verificationSystem.connect(verifier).grantVerification(user1.address, 1, 0);
    });

    it("Should allow verifier to revoke verification", async function () {
      await verificationSystem.connect(verifier).revokeVerification(user1.address, 1);

      expect(await verificationSystem.isVerified(user1.address, 1)).to.be.false;
    });

    it("Should emit VerificationRevoked event", async function () {
      await expect(
        verificationSystem.connect(verifier).revokeVerification(user1.address, 1)
      )
        .to.emit(verificationSystem, "VerificationRevoked")
        .withArgs(user1.address, 1, verifier.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should fail if non-verifier tries to revoke", async function () {
      await expect(
        verificationSystem.connect(user2).revokeVerification(user1.address, 1)
      ).to.be.revertedWith("Not authorized verifier");
    });
  });

  describe("Verification Queries", function () {
    beforeEach(async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);
      await verificationSystem.connect(verifier).grantVerification(user1.address, 0, 0); // IDENTITY
      await verificationSystem.connect(verifier).grantVerification(user1.address, 1, 0); // AGE
      await verificationSystem.connect(verifier).grantVerification(user1.address, 4, 0); // EDUCATION
    });

    it("Should get all verifications for user", async function () {
      const result = await verificationSystem.getUserVerifications(user1.address);
      const types = result[0]; // types array

      expect(types.length).to.equal(3);
      expect(Number(types[0])).to.equal(0); // IDENTITY
      expect(Number(types[1])).to.equal(1); // AGE
      expect(Number(types[2])).to.equal(4); // EDUCATION
    });

    it("Should get verification details", async function () {
      const verification = await verificationSystem.verifications(user1.address, 1);

      expect(verification.isVerified).to.be.true;
      expect(verification.verifiedBy).to.equal(verifier.address);
      expect(verification.expiresAt).to.equal(0);
    });

    it("Should return false for non-verified types", async function () {
      expect(await verificationSystem.isVerified(user1.address, 2)).to.be.false; // MARITAL_STATUS
      expect(await verificationSystem.isVerified(user1.address, 3)).to.be.false; // BACKGROUND_CHECK
    });

    it("Should return empty array for user with no verifications", async function () {
      const result = await verificationSystem.getUserVerifications(user2.address);
      const types = result[0]; // types array
      expect(types.length).to.equal(0);
    });
  });

  describe("Verification Expiration", function () {
    it("Should handle expired verifications", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);

      const pastTimestamp = Math.floor(Date.now() / 1000) - 86400; // 1 day ago

      await verificationSystem.connect(verifier).grantVerification(
        user1.address,
        1,
        pastTimestamp
      );

      // Note: isVerified in the contract doesn't check expiration automatically
      // This would need to be handled by the frontend or a view function
      const verification = await verificationSystem.verifications(user1.address, 1);
      expect(verification.isVerified).to.be.true;
      expect(verification.expiresAt).to.equal(pastTimestamp);
    });
  });

  describe("Karma System Integration", function () {
    it("Education verification represents module completion (karma boost)", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);

      // Simulate completing 2 education modules
      await verificationSystem.connect(verifier).grantVerification(user1.address, 4, 0); // EDUCATION module 1
      await verificationSystem.connect(verifier).grantVerification(user1.address, 5, 0); // EMPLOYMENT module (repurposed as module 2)

      const result = await verificationSystem.getUserVerifications(user1.address);
      const types = result[0];

      // Each verification = 20 karma points (as per karma system)
      expect(types.length).to.equal(2);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle re-granting same verification", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);

      await verificationSystem.connect(verifier).grantVerification(user1.address, 1, 0);
      await verificationSystem.connect(verifier).grantVerification(user1.address, 1, 0);

      expect(await verificationSystem.isVerified(user1.address, 1)).to.be.true;

      // Should appear in user verifications (may appear multiple times due to array push)
      const result = await verificationSystem.getUserVerifications(user1.address);
      const types = result[0];

      // Count how many times type 1 appears
      const count = types.filter(v => Number(v) === 1).length;
      expect(count).to.be.greaterThan(0); // At least one instance
    });

    it("Should handle verification after profile deactivation", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);
      await verificationSystem.connect(verifier).grantVerification(user1.address, 1, 0);

      // Deactivate profile
      await profileNFT.connect(user1).deactivateProfile();

      // Verification should still be recorded
      expect(await verificationSystem.isVerified(user1.address, 1)).to.be.true;
    });

    it("Should handle all verification types", async function () {
      await verificationSystem.connect(owner).addVerifier(verifier.address);

      // Grant all 6 types (repurposed as education modules)
      for (let i = 0; i < 6; i++) {
        await verificationSystem.connect(verifier).grantVerification(user1.address, i, 0);
      }

      const result = await verificationSystem.getUserVerifications(user1.address);
      const types = result[0];
      expect(types.length).to.equal(6);
    });
  });
});
