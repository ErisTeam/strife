import type { Meta, StoryObj } from 'storybook-solidjs';
import ChannelTitle from './ChannelTitle';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof ChannelTitle> = {
  component: ChannelTitle,
};

export default meta;
type Story = StoryObj<typeof ChannelTitle>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};