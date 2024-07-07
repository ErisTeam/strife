import { createResource, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import style from './css.module.css';
import { getLocalUserInfo } from '@/API/User';
import type { User } from '@/types/User';
export function UserPanel() {
  const AppState = useAppState();

  const [userInfo] = createResource<User>(async () => {
    const res = await getLocalUserInfo(AppState.userId());
    console.log(res);
    //TODO: store user info in app state
    return res as User;
  });

  console.log(userInfo());

  return (
    <main class={style.userPanel}>
      <img
        src="https://s3.amazonaws.com/www-inside-design/uploads/2020/10/aspect-ratios-blogpost-1x1-1.png"
        alt="User"
      />
      <div class={style.user}>
        <span>Display name</span>
        <h2>@{userInfo()?.username}</h2>
        <p>status pp</p>
      </div>
    </main>
  );
}
