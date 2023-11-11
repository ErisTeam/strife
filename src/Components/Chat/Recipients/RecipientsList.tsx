import { useAppState } from '@/AppState';
import Person from '@/Components/Friends/Person';
import { For } from 'solid-js';
type RecipientsListProps = {
	guildId: string;
};
export default (props: RecipientsListProps) => {
	const AppState = useAppState();
	return (
		<ol>
			<For each={AppState.openedGuildsAdditionalData[props.guildId]?.groups}>
				{(group) => {
					const recipients = AppState.openedGuildsAdditionalData[props.guildId].recipients.slice(
						group.start_index,
						group.start_index + group.count,
					);
					return (
						<li>
							Group {group.name}
							<For each={recipients}>
								{(recipient) => {
									let img;

									if (recipient.user.avatar) {
										img = `https://cdn.discordapp.com/avatars/${recipient.user.id}/${recipient.user.avatar}.webp?size=32`;
									} else {
										img = '/Friends/fallback.png';
									}
									let status;
									if (recipient.presence.activities.length) {
										switch (recipient.presence.activities[recipient.presence.activities.length - 1].type) {
											case 0: {
												status =
													'Playing ' + recipient.presence.activities[recipient.presence.activities.length - 1].name;
												break;
											}
											case 4: {
												status = recipient.presence.activities[recipient.presence.activities.length - 1].state;
											}
										}
									} else {
										status = recipient.presence.status;
									}

									return (
										<Person img={img} name={recipient.user.global_name || recipient.user.username} status={status} />
									);
								}}
							</For>
						</li>
					);
				}}
			</For>
		</ol>
	);
};
