import type { Meta, StoryObj } from 'storybook-solidjs';
import GuildList from './GuildList';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof GuildList> = {
  component: GuildList,
};

export default meta;
type Story = StoryObj<typeof GuildList>;

export const TestStory: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};