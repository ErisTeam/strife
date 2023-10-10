import type { Meta, StoryObj } from 'storybook-solidjs';
import TabList from './TabList';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof TabList> = {
  component: TabList,
};

export default meta;
type Story = StoryObj<typeof TabList>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};