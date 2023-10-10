import type { Meta, StoryObj } from 'storybook-solidjs';
import TabWindow from './TabWindow';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof TabWindow> = {
  component: TabWindow,
};

export default meta;
type Story = StoryObj<typeof TabWindow>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};