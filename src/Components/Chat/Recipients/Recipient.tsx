import { PublicUser } from '@/types/User';

type RecipientProps = {
	recipient: PublicUser;
	onClick?: (e: Event | MouseEvent) => void;
};
export default (props: RecipientProps) => {
	return <span>{JSON.stringify(props)}</span>;
};
