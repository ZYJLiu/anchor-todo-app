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

import { program, TaskData } from "@/anchor/setup";
import TaskItem from "./task-item";

export default function TaskList() {
  // Get the connected wallet and connection
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Map of task account address to task data for the current user
  const [taskMap, setTaskMap] = useState<Map<string, TaskData>>(new Map());

  // Track the selected task key (account address) to update
  const [selectedTaskKey, setSelectedTaskKey] = useState<string | null>(null);
  const [updateValue, setUpdateValue] = useState("");

  // Map to track the loading state of the delete button for each task
  const [deleteLoadingStates, setDeleteLoadingStates] = useState(new Map());
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // Modal state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    fetchProgramAccounts();

    const createTaskEventListener = program.addEventListener(
      "CreateTask",
      (event) => updateMapWithEvent(event)
    );

    const updateTaskEventListener = program.addEventListener(
      "UpdateTask",
      (event) => updateMapWithEvent(event)
    );

    const deleteTaskEventListener = program.addEventListener(
      "DeleteTask",
      (event) => updateMapWithEvent(event, true)
    );

    console.log("createTaskEventListener: ", createTaskEventListener);
    console.log("updateTaskEventListener: ", updateTaskEventListener);
    console.log("deleteTaskEventListener: ", deleteTaskEventListener);

    return () => {
      const removeEventListeners = async () => {
        await program.removeEventListener(createTaskEventListener);
        await program.removeEventListener(updateTaskEventListener);
        await program.removeEventListener(deleteTaskEventListener);
        console.log("remove event listeners");
      };

      removeEventListeners();
    };
  }, [connected]);

  const fetchProgramAccounts = async () => {
    if (!publicKey) {
      // If the user disconnects, clear the task map
      setTaskMap(new Map());
      return;
    }

    // Fetch all program accounts for the current connected user
    const programAccounts = await program.account.task.all([
      {
        memcmp: {
          bytes: publicKey.toString(), // filter for user account address
          offset: 8, // 8 byte discriminator offset
        },
      },
    ]);

    // Convert the array to a map and save it to state
    const newTaskMap = new Map();
    programAccounts.forEach((task) => {
      newTaskMap.set(
        task.publicKey.toString(), // on-chain task account address
        task.account // task account data
      );
    });
    setTaskMap(newTaskMap);
  };

  const updateMapWithEvent = (event: any, isDelete = false) => {
    console.log("event: ", event);
    console.log("user: ", event.user.toString());
    console.log("task: ", event.task.toString());
    console.log("wallet", publicKey?.toString());
    // Only update the map if the event is for the current user
    if (event.user.toString() != publicKey?.toString()) return;

    setTaskMap((prevTaskMap) => {
      const newTaskMap = new Map(prevTaskMap);
      if (isDelete) {
        newTaskMap.delete(event.task.toString());
      } else {
        newTaskMap.set(event.task.toString(), {
          user: event.user,
          message: event.message,
        });
      }
      return newTaskMap;
    });
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
          {Array.from(taskMap.entries()).map(([key, taskData]) => (
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
