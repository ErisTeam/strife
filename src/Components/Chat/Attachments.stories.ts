import type { Meta, StoryObj } from 'storybook-solidjs';
import Attachments from './Attachments';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Attachments> = {
  component: Attachments,
};

export default meta;
type Story = StoryObj<typeof Attachments>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};