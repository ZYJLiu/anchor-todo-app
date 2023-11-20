"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { Keypair } from "@solana/web3.js";
import toast, { Toaster } from "react-hot-toast";

export default function CreateTask() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    console.log("Create Task");
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const task = new Keypair();
      const transaction = await program.methods
        .create(input)
        .accounts({
          user: publicKey,
          task: task.publicKey,
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection,
        {
          signers: [task],
        }
      );

      toast.success(
        <a
          href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
          target="_blank"
        >
          View on Solana Explorer
        </a>,
        {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex justify-center ">
          <h1 className="font-bold text-large"> Anchor CRUD App</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <Textarea
            label="Description"
            placeholder="Enter description"
            value={input}
            onValueChange={setInput}
            variant="bordered"
            isDisabled={!publicKey}
            minRows={1}
          />
          <Button
            className="mt-2"
            size="sm"
            color="primary"
            isLoading={isLoading}
            isDisabled={!publicKey}
            onClick={handleCreate}
          >
            Create
          </Button>
        </CardBody>
      </Card>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  );
}
