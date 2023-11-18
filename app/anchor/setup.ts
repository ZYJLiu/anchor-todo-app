import { IdlAccounts, Program, IdlEvents } from "@coral-xyz/anchor";
import { IDL, Todo } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const programId = new PublicKey("HhaBvvmMtHPU62mLhAJxWmmwGtN5aqCm5oeJbnRHER43");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program<Todo>(IDL, programId, {
  connection,
});

export type TaskData = IdlAccounts<Todo>["task"];

export type CreateTask = IdlEvents<Todo>["CreateTask"];
export type UpdateTask = IdlEvents<Todo>["UpdateTask"];
export type DeleteTask = IdlEvents<Todo>["DeleteTask"];
