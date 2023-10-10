import type { Meta, StoryObj } from 'storybook-solidjs';
import ChannelList from './ChannelList';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof ChannelList> = {
  component: ChannelList,
};

export default meta;
type Story = StoryObj<typeof ChannelList>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};