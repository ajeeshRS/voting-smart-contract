import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingSystem } from "../target/types/voting_system";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

const POLL_SEED = "POLL_SEED";
const VOTE_RECORD_SEED = "VOTE_SEED";
const OPTION_LENGTH = 32;

const DESCRIPTION_LENGTH = 500;

let POLLPDA;

describe("voting_system", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VotingSystem as Program<VotingSystem>;

  const pollCreator = anchor.web3.Keypair.generate();

  describe("Initialize Poll", async () => {
    it("Initialize Poll", async () => {
      await airdrop(provider.connection, pollCreator.publicKey);

      const title = "Favorite Programming";
      const description = "Vote for your favorite programming language.";
      const options = ["Rust", "Typescript", "JavaScript", "Python"];

      const [pollPda] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode(title),
          anchor.utils.bytes.utf8.encode(POLL_SEED),
          pollCreator.publicKey.toBuffer(),
        ],
        program.programId
      );

      POLLPDA = pollPda;

      await program.methods
        .initializePoll(title, description, options)
        .accounts({
          poll: pollPda,
          authority: pollCreator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([pollCreator])
        .rpc({ commitment: "confirmed" });

      const pollAccount = await program.account.poll.fetch(pollPda);

      assert.equal(
        pollAccount.authority.toBase58(),
        pollCreator.publicKey.toBase58()
      );

      assert.equal(
        Buffer.from(pollAccount.title).toString().replace(/\0/g, ""),
        title
      );

      assert.deepEqual(
        pollAccount.options
          .map((op) => Buffer.from(op).toString().replace(/\0/g, ""))
          .filter((option) => option.length > 0),
        options
      );
    });

    it("Cannot initialize poll when title is longer than 32 bytes", async () => {
      let should_fail = "This Should Fail";
      const title =
        "This title is too long bla bla bla bla bla bla bla bla bla bla bla";
      const description = "Vote for your favorite programming language.";
      const options = ["Rust", "Typescript", "JavaScript", "Python"];

      try {
        const [pollPda, pollBump] = PublicKey.findProgramAddressSync(
          [
            anchor.utils.bytes.utf8.encode(title),
            anchor.utils.bytes.utf8.encode(POLL_SEED),
            pollCreator.publicKey.toBuffer(),
          ],
          program.programId
        );

        await program.methods
          .initializePoll(title, description, options)
          .accounts({
            poll: pollPda,
            authority: pollCreator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([pollCreator])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        assert.strictEqual(error.message, "Max seed length exceeded");
        should_fail = "Failed";
      }

      assert.strictEqual(should_fail, "Failed");
    });

    it("Cannot initialize poll when description is longer than 500 bytes", async () => {
      let should_fail = "This Should Fail";

      const title = "HEHE";
      const description = "D".repeat(DESCRIPTION_LENGTH + 1);
      const options = ["Rust", "Typescript", "JavaScript", "Python"];

      try {
        const [pollPda, pollBump] = PublicKey.findProgramAddressSync(
          [
            anchor.utils.bytes.utf8.encode(title),
            anchor.utils.bytes.utf8.encode(POLL_SEED),
            pollCreator.publicKey.toBuffer(),
          ],
          program.programId
        );

        await program.methods
          .initializePoll(title, description, options)
          .accounts({
            poll: pollPda,
            authority: pollCreator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([pollCreator])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "DescriptionTooLong");
        should_fail = "Failed";
      }

      assert.strictEqual(should_fail, "Failed");
    });

    it("Cannot initialize poll when option count limit(4) exceeds", async () => {
      let should_fail = "This Should Fail";

      const title = "HEHE";
      const description = "Vote for your favorite programming language.";
      const options = ["Rust", "Typescript", "JavaScript", "Python", "Java"];

      try {
        const [pollPda, pollBump] = PublicKey.findProgramAddressSync(
          [
            anchor.utils.bytes.utf8.encode(title),
            anchor.utils.bytes.utf8.encode(POLL_SEED),
            pollCreator.publicKey.toBuffer(),
          ],
          program.programId
        );

        await program.methods
          .initializePoll(title, description, options)
          .accounts({
            poll: pollPda,
            authority: pollCreator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([pollCreator])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "OptionCountLimitExceeds");
        should_fail = "Failed";
      }

      assert.strictEqual(should_fail, "Failed");
    });

    it("Cannot initialize poll when option text is longer than 32 bytes", async () => {
      let should_fail = "This Should Fail";

      const title = "HEHE";
      const description = "Vote for your favorite programming language.";
      const options = [
        "Rust",
        "Typescript",
        "J".repeat(OPTION_LENGTH + 1),
        "Python",
      ];

      try {
        const [pollPda, pollBump] = PublicKey.findProgramAddressSync(
          [
            anchor.utils.bytes.utf8.encode(title),
            anchor.utils.bytes.utf8.encode(POLL_SEED),
            pollCreator.publicKey.toBuffer(),
          ],
          program.programId
        );

        await program.methods
          .initializePoll(title, description, options)
          .accounts({
            poll: pollPda,
            authority: pollCreator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([pollCreator])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "OptionTooLong");
        should_fail = "Failed";
      }

      assert.strictEqual(should_fail, "Failed");
    });
  });

  describe("Caste vote", async () => {
    it("Successfully caste a vote", async () => {
      const optionIndex = 0;
      const voter = anchor.web3.Keypair.generate();

      await airdrop(provider.connection, voter.publicKey);

      const [voteRecordPda, pdaBump] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode(VOTE_RECORD_SEED),
          POLLPDA.toBuffer(),
          voter.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .castVote(optionIndex)
        .accounts({
          poll: POLLPDA,
          voteRecord: voteRecordPda,
          voter: voter.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([voter])
        .rpc({ commitment: "confirmed" });

      const pollAccount = await program.account.poll.fetch(POLLPDA);

      const voteRecordAccount = await program.account.voteRecord.fetch(
        voteRecordPda
      );

      assert.strictEqual(
        voteRecordAccount.voter.toBase58(),
        voter.publicKey.toBase58()
      );

      assert.strictEqual(pollAccount.votes[optionIndex].toNumber(), 1);

      assert.strictEqual(pollAccount.totalVotes.toNumber(), 1);
    });

    it("Cannot vote if user has already voted", async () => {
      const voter = anchor.web3.Keypair.generate();

      let should_fail = "This Should Fail";

      const optionIndex = 1;

      await airdrop(provider.connection, voter.publicKey);
      try {
        const [voteRecordPda, pdaBump] = PublicKey.findProgramAddressSync(
          [
            anchor.utils.bytes.utf8.encode(VOTE_RECORD_SEED),
            POLLPDA.toBuffer(),
            voter.publicKey.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .castVote(optionIndex)
          .accounts({
            poll: POLLPDA,
            voteRecord: voteRecordPda,
            voter: voter.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([voter])
          .rpc({ commitment: "confirmed" });

        const tx2 = await program.methods
          .castVote(optionIndex)
          .accounts({
            poll: POLLPDA,
            voteRecord: voteRecordPda,
            voter: voter.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([voter])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "AlreadyVoted");
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail, "Failed");
    });

    it("Cannot vote with an invalid option", async () => {
      let should_fail = "it should fail";
      const optionIndex = 5;
      const voter = anchor.web3.Keypair.generate();

      await airdrop(provider.connection, voter.publicKey);

      const [voteRecordPda, pdaBump] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode(VOTE_RECORD_SEED),
          POLLPDA.toBuffer(),
          voter.publicKey.toBuffer(),
        ],
        program.programId
      );

      try {
        const tx = await program.methods
          .castVote(optionIndex)
          .accounts({
            poll: POLLPDA,
            voteRecord: voteRecordPda,
            voter: voter.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([voter])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "InvalidOptionIndex");
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail, "Failed");
    });
  });

  describe("Close Poll", async () => {
    it("Closing poll by unauthorised authority is not allowed", async () => {
      const randomUser = anchor.web3.Keypair.generate();
      let should_fail = "this should fail";

      try {
        await program.methods
          .closePoll()
          .accounts({
            poll: POLLPDA,
            authority: randomUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([randomUser])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "ConstraintSeeds");
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail, "Failed");
    });

    it("Closing poll by unknown signer is not allowed", async () => {
      const randomUser = anchor.web3.Keypair.generate();
      let should_fail = "this should fail";

      try {
        await program.methods
          .closePoll()
          .accounts({
            poll: POLLPDA,
            authority: pollCreator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([randomUser])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const errName = error.toString().split(":")[1].trim();
        assert.strictEqual(errName, "unknown signer");
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail, "Failed");
    });

    it("Closing poll by authorised account is allowed", async () => {
      await program.methods
        .closePoll()
        .accounts({
          poll: POLLPDA,
          authority: pollCreator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([pollCreator])
        .rpc({ commitment: "confirmed" });

      const pollAccount = await program.account.poll.fetch(POLLPDA);

      assert.strictEqual(pollAccount.isPollClosed, true);
    });

    it("Closing poll is not allowed if it is already closed", async () => {
      let should_fail = "this should fail";
      try {
        await program.methods
          .closePoll()
          .accounts({
            poll: POLLPDA,
            authority: pollCreator.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([pollCreator])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "PollAlreadyClosed");
        should_fail = "Failed";
      }

      assert.strictEqual(should_fail, "Failed");
    });
  });

  async function airdrop(connection: any, address: any, amount = 1000000000) {
    await connection.confirmTransaction(
      await connection.requestAirdrop(address, amount),
      "confirmed"
    );
  }
});
