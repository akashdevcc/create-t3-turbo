import type { Meta, StoryObj } from "@storybook/react";

import { Post } from "@acme/native";

const meta = {
  title: "Another Post",
  component: Post,
} satisfies Meta<typeof Post>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "Another title",
    content: "Another content",
  },
};
