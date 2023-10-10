import type { Meta, StoryObj } from 'storybook-solidjs';
import QRCodeComp from './QRCode';

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof QRCodeComp> = {
  component: QRCodeComp,
};

export default meta;
type Story = StoryObj<typeof QRCodeComp>;

export const QRCode: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};