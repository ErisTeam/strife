import type { Meta, StoryObj } from 'storybook-solidjs';
import TwitterEmbed from './TwitterEmbed';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof TwitterEmbed> = {
  component: TwitterEmbed,
};

export default meta;
type Story = StoryObj<typeof TwitterEmbed>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};