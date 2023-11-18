import React from "react";
import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";

interface TaskData {
  message: string;
}

interface TaskItemProps {
  taskKey: string;
  taskData: TaskData;
  onOpen: () => void;
  setSelectedTaskKey: (key: string) => void;
  handleDelete: (key: string) => void;
  isDeleteLoading: boolean;
}

export default function TaskItem({
  taskKey,
  taskData,
  onOpen,
  setSelectedTaskKey,
  handleDelete,
  isDeleteLoading,
}: TaskItemProps) {
  return (
    <div className="flex flex-col mb-2">
      <label className="text-sm">Message:</label>
      <p className="text-center text-sm">{taskData.message}</p>
      <div className="flex space-x-2 mt-2">
        <Button
          size="sm"
          color="primary"
          onClick={() => {
            setSelectedTaskKey(taskKey);
            onOpen();
          }}
        >
          Update
        </Button>
        <Button
          size="sm"
          color="danger"
          isLoading={isDeleteLoading}
          onClick={() => handleDelete(taskKey)}
        >
          {isDeleteLoading ? "" : "Delete"}
        </Button>
        <Button
          size="sm"
          color="primary"
          variant="ghost"
          href={`https://explorer.solana.com/account/${taskKey}/anchor-account?cluster=devnet`}
          isExternal
          as={Link}
          showAnchorIcon
        >
          Link
        </Button>
      </div>
      <Divider className="mt-2" />
    </div>
  );
}
