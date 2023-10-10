import type { Meta, StoryObj } from 'storybook-solidjs';
import TabShadow from './TabShadow';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof TabShadow> = {
  component: TabShadow,
};

export default meta;
type Story = StoryObj<typeof TabShadow>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};