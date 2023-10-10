import type { Meta, StoryObj } from 'storybook-solidjs';
import MFABoxComp from './MFABox';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof MFABoxComp> = {
  component: MFABoxComp,
};

export default meta;
type Story = StoryObj<typeof MFABoxComp>;

export const MFABox: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};