type GuildsResponse = { guild_affinities: Array<{ guild_id: string; affinity: number }> };

type UsersResponse = { inverse_user_affinities: []; user_affinities: Array<{ user_id: string; affinity: number }> };
export type { GuildsResponse, UsersResponse };
