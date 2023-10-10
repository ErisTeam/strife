import type { Meta, StoryObj } from 'storybook-solidjs';
import LoginBoxComp from './LoginBox';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof LoginBoxComp> = {
  component: LoginBoxComp,
};

export default meta;
type Story = StoryObj<typeof LoginBoxComp>;

export const LoginBox: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};