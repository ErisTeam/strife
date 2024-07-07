import { ErrorBoundary, type JSX, Suspense } from 'solid-js';
import { Loading } from '../Loading/Loading';
import buttons from '../../Styles/Buttons.module.css';

export function SuspenseErrorBoundary(props: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary
        fallback={(err: Error, reset) => {
          console.error(err);
          return (
            <Loading
              message={
                <>
                  <h3>{err.toString()}</h3>
                  <h5>{err.stack}</h5>
                  <button class={buttons.default} onclick={reset} type="button">
                    Refresh
                  </button>
                </>
              }
            />
          );
        }}
      >
        {props.children}
      </ErrorBoundary>
    </Suspense>
  );
}
