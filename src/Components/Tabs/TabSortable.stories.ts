import type { Meta, StoryObj } from 'storybook-solidjs';
import TabSortable from './TabSortable';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof TabSortable> = {
  component: TabSortable,
};

export default meta;
type Story = StoryObj<typeof TabSortable>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};