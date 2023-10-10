import type { Meta, StoryObj } from 'storybook-solidjs';
import WelcomeTab from './WelcomeTab';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof WelcomeTab> = {
  component: WelcomeTab,
};

export default meta;
type Story = StoryObj<typeof WelcomeTab>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};