
import type { Meta, StoryObj } from 'storybook-solidjs';
import Embed from './Embed';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Embed> = {
  component: Embed,
};

export default meta;
type Story = StoryObj<typeof Embed>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};