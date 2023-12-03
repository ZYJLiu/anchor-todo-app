"use client";

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Card, CardBody } from "@nextui-org/card";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import toast, { Toaster } from "react-hot-toast";
import useSWR from "swr";

import { program, TaskData } from "@/anchor/setup";
import TaskItem from "./task-item";

export default function TaskList() {
  // Get the connected wallet and connection
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Track the selected task key (account address) to update
  const [selectedTaskKey, setSelectedTaskKey] = useState<string | null>(null);
  const [updateValue, setUpdateValue] = useState("");

  // Map to track the loading state of the delete button for each task
  const [deleteLoadingStates, setDeleteLoadingStates] = useState(new Map());
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // Modal state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // SWR fetcher function
  const fetchTasks = async (pubKey: string) => {
    console.log("fetch tasks", pubKey);
    if (!pubKey) {
      throw new Error("Wallet not connected");
    }
    const programAccounts = await program.account.task.all([
      {
        memcmp: {
          bytes: pubKey,
          offset: 8,
        },
      },
    ]);
    const newTaskMap = new Map();
    programAccounts.forEach((task) => {
      newTaskMap.set(task.publicKey.toString(), task.account);
    });
    return newTaskMap;
  };

  // Use SWR to manage task data
  const { data: taskMap, mutate } = useSWR<Map<string, TaskData>>(
    publicKey?.toString(),
    fetchTasks
  );

  useEffect(() => {
    const createTaskEventListener = program.addEventListener(
      "CreateTask",
      (event) => handleEvent(event)
    );

    const updateTaskEventListener = program.addEventListener(
      "UpdateTask",
      (event) => handleEvent(event)
    );

    const deleteTaskEventListener = program.addEventListener(
      "DeleteTask",
      (event) => handleEvent(event, true)
    );

    return () => {
      const removeEventListeners = async () => {
        await program.removeEventListener(createTaskEventListener);
        await program.removeEventListener(updateTaskEventListener);
        await program.removeEventListener(deleteTaskEventListener);
      };

      removeEventListeners();
    };
  }, [connected]);

  const handleEvent = (event: any, isDelete = false) => {
    console.log("event:", event);
    if (event.user.toString() !== publicKey?.toString()) return;

    mutate((currentMap) => {
      const newTaskMap = new Map(currentMap);
      if (isDelete) {
        newTaskMap.delete(event.task.toString());
      } else {
        newTaskMap.set(event.task.toString(), {
          user: event.user,
          message: event.message,
        });
      }
      console.log("mutate tasks");
      return newTaskMap;
    }, false); // 'false' means no revalidation
  };

  // Invoke the update instruction on the program
  const handleUpdate = async (task: string) => {
    console.log("update task: ", task);
    if (!publicKey) return;

    setIsUpdateLoading(true);
    try {
      const transaction = await program.methods
        .update(updateValue)
        .accounts({
          user: publicKey,
          task: task,
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      showToast(transactionSignature);

      // Close the modal and reset the update value
      onOpenChange();
      setUpdateValue("");
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  // Invoke the delete instruction on the program
  const handleDelete = async (task: string) => {
    console.log("delete task: ", task);
    if (!publicKey) return;

    setDeleteLoadingStates((prev) => new Map(prev).set(task, true));
    try {
      const transaction = await program.methods
        .delete()
        .accounts({
          user: publicKey,
          task: task,
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      showToast(transactionSignature);
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoadingStates((prev) => new Map(prev).set(task, false));
    }
  };

  // display toast notification with a link to solana explorer
  const showToast = (transactionSignature: string) => {
    toast.success(
      <a
        href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
        target="_blank"
        rel="noopener noreferrer"
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
  };

  return publicKey ? (
    <>
      <Card>
        <CardBody>
          {taskMap &&
            Array.from(taskMap.entries()).map(([key, taskData]) => (
              <TaskItem
                key={key}
                taskKey={key}
                taskData={taskData}
                onOpen={onOpen}
                setSelectedTaskKey={setSelectedTaskKey}
                handleDelete={handleDelete}
                isDeleteLoading={deleteLoadingStates.get(key) || false}
              />
            ))}
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Task
              </ModalHeader>
              <ModalBody>
                <Textarea
                  minRows={1}
                  value={updateValue}
                  onValueChange={setUpdateValue}
                  placeholder="Enter update message"
                />
              </ModalBody>
              <ModalFooter>
                <Button size="sm" onPress={onClose}>
                  Close
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  isLoading={isUpdateLoading}
                  onClick={() => handleUpdate(selectedTaskKey!)}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  ) : (
    <div>Connect wallet</div>
  );
}
