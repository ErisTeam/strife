type guild_affinities = { guild_id: string; affinity: number };
type GuildsResponse = { guild_affinities: Array<guild_affinities> };

type user_affinities = { user_id: string; affinity: number };
type UsersResponse = { inverse_user_affinities: []; user_affinities: Array<user_affinities> };
type Role = {
	id: string;
	name: string;
	permissions: string;
	position: number;
	color: number;
	hoist: boolean;
	managed: boolean;
	mentionable: boolean;
};
type Guild = {
	id: string;
	name: string;
	icon: string;
	description: string;
	splash: string;
	member_count: number;
	presence_count: number;
	features: string[];
	banner: string;
	ownerId: string;
	roles: Role[];
};
export type { GuildsResponse, UsersResponse, Role, Guild };
