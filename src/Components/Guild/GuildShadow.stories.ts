import type { Meta, StoryObj } from 'storybook-solidjs';
import GuildShadow from './GuildShadow';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof GuildShadow> = {
  component: GuildShadow,
};

export default meta;
type Story = StoryObj<typeof GuildShadow>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};