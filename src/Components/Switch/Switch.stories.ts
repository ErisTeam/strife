import type { Meta, StoryObj } from 'storybook-solidjs';
import Switch from './Switch';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Switch> = {
  component: Switch,
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};