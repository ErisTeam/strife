
import type { Meta, StoryObj } from 'storybook-solidjs';
import Chat from './Chat';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Chat> = {
  component: Chat,
};

export default meta;
type Story = StoryObj<typeof Chat>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};