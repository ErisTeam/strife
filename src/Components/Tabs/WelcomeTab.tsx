import { createResource } from 'solid-js';
import { useAppState } from '../../AppState';
// import { useTabContext } from './Tabs';

import style from './Tabs.module.css';
import { getLocalUserInfo } from '@/API/User';
import type { User } from '@/types/User';

export function WelcomeTab() {
  // const tabData = useTabContext();

  const AppState = useAppState();

  const [userInfo] = createResource(async () => {
    const res = await getLocalUserInfo(AppState.userId());
    console.log(res);
    return res as User;
  });

  console.log('WelcomeTab');

  return (
    <div class={style.welcomeTab}>
      <h1>Welcome: {userInfo()?.username}</h1>
    </div>
  );
}
