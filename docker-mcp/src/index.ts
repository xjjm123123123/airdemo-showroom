#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import Docker from "dockerode";

const docker = new Docker();

const server = new Server(
  {
    name: "docker-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "docker_list_images",
        description: "List local Docker images",
        inputSchema: {
          type: "object",
          properties: {
            all: {
              type: "boolean",
              description: "Show all images (default hides intermediate images)",
            },
          },
        },
      },
      {
        name: "docker_build_image",
        description: "Build a Docker image from a Dockerfile",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the directory containing the Dockerfile",
            },
            tag: {
              type: "string",
              description: "Tag to apply to the built image (e.g., 'myimage:latest')",
            },
          },
          required: ["path", "tag"],
        },
      },
      {
        name: "docker_push_image",
        description: "Push an image to a registry",
        inputSchema: {
          type: "object",
          properties: {
            image: {
              type: "string",
              description: "Image name to push (e.g., 'myrepo/myimage:tag')",
            },
            authConfig: {
              type: "object",
              description: "Authentication configuration (optional if already logged in)",
              properties: {
                username: { type: "string" },
                password: { type: "string" },
                serveraddress: { type: "string" },
              },
            },
          },
          required: ["image"],
        },
      },
      {
        name: "docker_list_containers",
        description: "List local Docker containers",
        inputSchema: {
          type: "object",
          properties: {
            all: {
              type: "boolean",
              description: "Show all containers (default shows just running)",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "docker_list_images": {
        const { all } = request.params.arguments as { all?: boolean };
        const images = await docker.listImages({ all });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(images, null, 2),
            },
          ],
        };
      }

      case "docker_build_image": {
        const { path, tag } = request.params.arguments as {
          path: string;
          tag: string;
        };
        // Note: dockerode buildImage takes a stream or tarball.
        // For simplicity in this MCP, we might shell out to `docker build` command
        // because dockerode requires tarring the context which is complex to do here without extra libs.
        // BUT, since we are in a node env, we can use child_process for simplicity and reliability.
        // Actually, let's use child_process for build and push to ensure we use the CLI's auth and context.
        // It's often more robust for these operations.
        
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);

        const result = await execAsync(`docker build -t ${tag} ${path}`);
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr,
            },
          ],
        };
      }

      case "docker_push_image": {
        const { image } = request.params.arguments as { image: string };
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);

        const result = await execAsync(`docker push ${image}`);
        return {
          content: [
            {
              type: "text",
              text: result.stdout || result.stderr,
            },
          ],
        };
      }
      
      case "docker_list_containers": {
          const { all } = request.params.arguments as { all?: boolean };
          const containers = await docker.listContainers({ all });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(containers, null, 2),
              },
            ],
          };
      }

      default:
        throw new Error("Unknown tool");
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
