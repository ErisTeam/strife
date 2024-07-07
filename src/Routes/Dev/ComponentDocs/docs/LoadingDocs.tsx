import { Loading } from '../../../../Components/Loading/Loading';
import style from './../ComponentDocs.module.css';

export function LoadingDocs() {
  return (
    <section>
      <h3>Loading</h3>
      <div class={style.preview}>
        <Loading />
      </div>
    </section>
  );
}
