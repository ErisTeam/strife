
import type { Meta, StoryObj } from 'storybook-solidjs';
import UserMention from './UserMention';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof UserMention> = {
  component: UserMention,
};

export default meta;
type Story = StoryObj<typeof UserMention>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};