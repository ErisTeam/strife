import type { Meta, StoryObj } from 'storybook-solidjs';
import MessageContextMenu from './MessageContextMenu';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof MessageContextMenu> = {
  component: MessageContextMenu,
};

export default meta;
type Story = StoryObj<typeof MessageContextMenu>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};
