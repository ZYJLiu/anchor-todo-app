export type Todo = {
  version: "0.1.0";
  name: "todo";
  instructions: [
    {
      name: "create";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "task";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "input";
          type: "string";
        }
      ];
    },
    {
      name: "update";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "task";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "input";
          type: "string";
        }
      ];
    },
    {
      name: "delete";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "task";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "task";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "publicKey";
          },
          {
            name: "message";
            type: "string";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "CreateTask";
      fields: [
        {
          name: "task";
          type: "publicKey";
          index: false;
        },
        {
          name: "user";
          type: "publicKey";
          index: false;
        },
        {
          name: "message";
          type: "string";
          index: false;
        }
      ];
    },
    {
      name: "UpdateTask";
      fields: [
        {
          name: "task";
          type: "publicKey";
          index: false;
        },
        {
          name: "user";
          type: "publicKey";
          index: false;
        },
        {
          name: "message";
          type: "string";
          index: false;
        }
      ];
    },
    {
      name: "DeleteTask";
      fields: [
        {
          name: "task";
          type: "publicKey";
          index: false;
        },
        {
          name: "user";
          type: "publicKey";
          index: false;
        }
      ];
    }
  ];
};

export const IDL: Todo = {
  version: "0.1.0",
  name: "todo",
  instructions: [
    {
      name: "create",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "task",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "input",
          type: "string",
        },
      ],
    },
    {
      name: "update",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "task",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "input",
          type: "string",
        },
      ],
    },
    {
      name: "delete",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "task",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "task",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey",
          },
          {
            name: "message",
            type: "string",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "CreateTask",
      fields: [
        {
          name: "task",
          type: "publicKey",
          index: false,
        },
        {
          name: "user",
          type: "publicKey",
          index: false,
        },
        {
          name: "message",
          type: "string",
          index: false,
        },
      ],
    },
    {
      name: "UpdateTask",
      fields: [
        {
          name: "task",
          type: "publicKey",
          index: false,
        },
        {
          name: "user",
          type: "publicKey",
          index: false,
        },
        {
          name: "message",
          type: "string",
          index: false,
        },
      ],
    },
    {
      name: "DeleteTask",
      fields: [
        {
          name: "task",
          type: "publicKey",
          index: false,
        },
        {
          name: "user",
          type: "publicKey",
          index: false,
        },
      ],
    },
  ],
};
