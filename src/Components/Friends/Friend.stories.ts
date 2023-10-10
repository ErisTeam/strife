
import type { Meta, StoryObj } from 'storybook-solidjs';
import Friend from './Friend';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Friend> = {
  component: Friend,
};

export default meta;
type Story = StoryObj<typeof Friend>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};