// command to generate on-chain program idl:
// anchor idl init --filepath target/idl/todo.json <PROGRAM_ID>
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Todo } from "../target/types/todo";
import { Keypair } from "@solana/web3.js";
import assert from "assert";

describe("todo", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Todo as Program<Todo>;

  const taskAccount = new Keypair();

  let createTaskEventPromise;
  let updateTaskEventPromise;
  let deleteTaskEventPromise;

  let createTaskEventListener;
  let updateTaskEventListener;
  let deleteTaskEventListener;

  before(async () => {
    createTaskEventPromise = new Promise((resolve) => {
      createTaskEventListener = program.addEventListener(
        "CreateTask",
        (event) => {
          console.log("CreateTask Event");
          resolve(event);
        }
      );
    });

    updateTaskEventPromise = new Promise((resolve) => {
      updateTaskEventListener = program.addEventListener(
        "UpdateTask",
        (event) => {
          console.log("UpdateTask Event");
          resolve(event);
        }
      );
    });

    deleteTaskEventPromise = new Promise((resolve) => {
      deleteTaskEventListener = program.addEventListener(
        "DeleteTask",
        (event) => {
          console.log("DeleteTask Event");
          resolve(event);
        }
      );
    });
  });

  after(async () => {
    await program.removeEventListener(createTaskEventListener);
    await program.removeEventListener(updateTaskEventListener);
    await program.removeEventListener(deleteTaskEventListener);
  });

  it("Create Task", async () => {
    const input = "Hello Solana";

    const transactionSignature = await program.methods
      .create(input)
      .accounts({
        user: wallet.publicKey,
        task: taskAccount.publicKey,
      })
      .signers([taskAccount])
      .rpc();

    console.log("Your transaction signature", transactionSignature);

    const data = await program.account.task.fetch(taskAccount.publicKey);
    assert(data.message == input);

    const event = await createTaskEventPromise;
    assert(event.user.toBase58() == wallet.publicKey.toBase58());
    assert(event.message == input);
  });

  it("Update Task", async () => {
    const input = "Only Possible On Solana";

    const transactionSignature = await program.methods
      .update(input)
      .accounts({
        user: wallet.publicKey,
        task: taskAccount.publicKey,
      })
      .rpc();

    console.log("Your transaction signature", transactionSignature);

    const data = await program.account.task.fetch(taskAccount.publicKey);
    assert(data.message == input);

    const event = await updateTaskEventPromise;
    assert(event.user.toBase58() == wallet.publicKey.toBase58());
    assert(event.message == input);
  });

  it("Close account", async () => {
    // Send transaction to close the account
    const transactionSignature = await program.methods
      .delete()
      .accounts({
        user: wallet.publicKey,
        task: taskAccount.publicKey,
      })
      .rpc();

    console.log("Your transaction signature", transactionSignature);

    try {
      // Expect error when fetching account since it was closed
      await program.account.task.fetch(taskAccount.publicKey);
    } catch (error) {
      assert.strictEqual(
        error.message,
        `Account does not exist or has no data ${taskAccount.publicKey.toBase58()}`
      );
    }

    const event = await deleteTaskEventPromise;
    assert(event.user.toBase58() == wallet.publicKey.toBase58());
    assert(event.task.toBase58() == taskAccount.publicKey.toBase58());
  });
});
