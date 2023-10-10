
import type { Meta, StoryObj } from 'storybook-solidjs';
import FriendsList from './FriendsList';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof FriendsList> = {
  component: FriendsList,
};

export default meta;
type Story = StoryObj<typeof FriendsList>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};