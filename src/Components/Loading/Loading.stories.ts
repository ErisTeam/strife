
import type { Meta, StoryObj } from 'storybook-solidjs';
import Loading from './Loading';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Loading> = {
  component: Loading,
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};