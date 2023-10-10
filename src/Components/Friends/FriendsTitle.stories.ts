import type { Meta, StoryObj } from 'storybook-solidjs';
import FriendsTitle from './FriendsTitle';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof FriendsTitle> = {
  component: FriendsTitle,
};

export default meta;
type Story = StoryObj<typeof FriendsTitle>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};