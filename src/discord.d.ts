type guild_affinities = { guild_id: string; affinity: number };
type GuildsResponse = { guild_affinities: Array<guild_affinities> };

type user_affinities = { user_id: string; affinity: number };
type UsersResponse = { inverse_user_affinities: []; user_affinities: Array<user_affinities> };
export type { GuildsResponse, UsersResponse };
