import { DEV, type JSX, createSignal } from 'solid-js';

const [created, setCreated] = createSignal();

export function Dev(props: { children?: JSX.Element }) {
  if (DEV) {
    console.log(document.querySelector('#dev'));
    if (document.querySelector('#dev') || created()) {
      return null;
      // return <Portal mount={document.querySelector('#dev') as Node}>{props.children}</Portal>;
    }
    setCreated(true);
    console.log(props.children);
    return undefined;
  }
  return <></>;
}
