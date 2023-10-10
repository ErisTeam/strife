import type { Meta, StoryObj } from 'storybook-solidjs';
import ChannelCategory from './ChannelListCategory';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof ChannelCategory> = {
  component: ChannelCategory,
};

export default meta;
type Story = StoryObj<typeof ChannelCategory>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};