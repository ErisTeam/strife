import { ErrorBoundary, JSX, Suspense } from 'solid-js';
import Loading from '../Loading/Loading';
import buttons from '../../Styles/Buttons.module.css';

export default (props: { children: JSX.Element | JSX.Element[] }) => {
	return (
		<Suspense fallback={<Loading />}>
			<ErrorBoundary
				fallback={(err, reset) => {
					return (
						<Loading
							message={
								<>
									<h3>{err.toString()}</h3>
									<button class={buttons.default} onclick={reset}>
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
};
