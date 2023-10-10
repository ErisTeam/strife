
import type { Meta, StoryObj } from 'storybook-solidjs';
import Message from './Message';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Message> = {
  component: Message,
};

export default meta;
type Story = StoryObj<typeof Message>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};