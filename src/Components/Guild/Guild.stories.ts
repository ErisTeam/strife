
import type { Meta, StoryObj } from 'storybook-solidjs';
import Guild from './Guild';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Guild> = {
  component: Guild,
};

export default meta;
type Story = StoryObj<typeof Guild>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};