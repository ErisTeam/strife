
import type { Meta, StoryObj } from 'storybook-solidjs';
import FriendsTab from './FriendsTab';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof FriendsTab> = {
  component: FriendsTab,
};

export default meta;
type Story = StoryObj<typeof FriendsTab>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};