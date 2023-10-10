import type { Meta, StoryObj } from 'storybook-solidjs';
import ChannelListElement from './ChannelListElement';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof ChannelListElement> = {
  component: ChannelListElement,
};

export default meta;
type Story = StoryObj<typeof ChannelListElement>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};